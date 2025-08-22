import { randomUUID } from "crypto";
import KB from "../models/KB.js";
import Ticket from "../models/Ticket.js";
import AgentSuggestion from "../models/AgentSuggestion.js";
import AuditLog from "../models/AuditLog.js";
import Config from "../models/Config.js";

const STUB = process.env.STUB_MODE === "true";

// Helper: write to audit log
async function log(ticketId, traceId, actor, action, meta = {}) {
  return AuditLog.create({
    ticketId,
    traceId,
    actor,
    action,
    meta,
    timestamp: new Date(),
  });
}

// --- Step 1: Classify ticket ---
function classify(text) {
  const lower = text.toLowerCase();

  if (/refund|invoice|payment|charge/.test(lower)) {
    return { predictedCategory: "billing", confidence: 0.9 };
  }
  if (/error|bug|stack|crash|login/.test(lower)) {
    return { predictedCategory: "tech", confidence: 0.9 };
  }
  if (/delivery|shipment|package|tracking/.test(lower)) {
    return { predictedCategory: "shipping", confidence: 0.9 };
  }
  return { predictedCategory: "other", confidence: 0.55 };
}

// --- Step 2: Retrieve KB articles ---
async function retrieveKB(query) {
  const regex = new RegExp(query.split(/\s+/).slice(0, 5).join("|"), "i");

  const articles = await KB.find({
    $or: [{ title: regex }, { body: regex }, { tags: regex }],
    status: "published",
  }).limit(3);

  return articles.map((a) => ({ id: a._id, title: a.title }));
}

// --- Step 3: Draft reply ---
function draftReply(ticket, articles) {
  const cites = articles.map((a, i) => `${i + 1}. ${a.title}`).join("\n");
  return `Hi, regarding “${ticket.title}”:

Here are some articles that may help:
${cites || "No relevant articles found."}

If this resolves your issue, we’ll mark the ticket resolved. Otherwise reply and we’ll loop in a human. – Auto-assistant`;
}

// --- Service factory ---
export default function makeAgent() {
  return {
    async triage(ticketId, traceId = randomUUID()) {
      try {
        const t = await Ticket.findById(ticketId).populate("createdBy");
        if (!t) {
          console.warn("Ticket not found for triage:", ticketId);
          return;
        }

        // Log received
        await log(t._id, traceId, "system", "TICKET_RECEIVED");

        // Classify
        const { predictedCategory, confidence } = classify(
          `${t.title} ${t.description}`
        );
        await log(t._id, traceId, "system", "AGENT_CLASSIFIED", {
          predictedCategory,
          confidence,
        });

        // Retrieve KB
        const topArticles = await retrieveKB(`${t.title} ${t.description}`);
        await log(t._id, traceId, "system", "KB_RETRIEVED", {
          count: topArticles.length,
        });

        // Draft reply
        const draft = draftReply(t, topArticles);
        const suggestion = await AgentSuggestion.create({
          ticketId: t._id,
          predictedCategory,
          articleIds: topArticles.map((a) => a.id),
          draftReply: draft,
          confidence,
          autoClosed: false,
          modelInfo: {
            provider: "stub",
            model: "rule-based",
            promptVersion: "v1",
            stub: STUB,
          },
        });
        await log(t._id, traceId, "system", "DRAFT_GENERATED", {
          suggestionId: suggestion._id,
        });

        // Config-driven decision
        const cfg = (await Config.findOne()) || {
          autoCloseEnabled: true,
          confidenceThreshold: 0.78,
        };

        if (cfg.autoCloseEnabled && confidence >= cfg.confidenceThreshold) {
          await Ticket.findByIdAndUpdate(t._id, {
            status: "resolved",
            category: predictedCategory,
            agentSuggestionId: suggestion._id,
          });
          await AgentSuggestion.findByIdAndUpdate(suggestion._id, {
            autoClosed: true,
          });
          await log(t._id, traceId, "system", "AUTO_CLOSED", {
            suggestionId: suggestion._id,
          });
        } else {
          await Ticket.findByIdAndUpdate(t._id, {
            status: "waiting_human",
            category: predictedCategory,
            agentSuggestionId: suggestion._id,
          });
          await log(t._id, traceId, "system", "ASSIGNED_TO_HUMAN", {
            suggestionId: suggestion._id,
          });
        }
      } catch (err) {
        console.error("❌ Agent triage failed:", err);
      }
    },
  };
}
