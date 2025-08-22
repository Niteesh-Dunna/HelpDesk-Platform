import express from "express";
import { randomUUID } from "crypto";
import Ticket from "../models/Ticket.js";
import { authMiddleware } from "../middleware/auth.js";
import AuditLog from "../models/AuditLog.js";
import AgentSuggestion from "../models/AgentSuggestion.js";

const router = express.Router();

/**
 * Agent-only middleware
 */
const agentMiddleware = (req, res, next) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

/**
 * CREATE ticket (user) with audit log & traceId
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const ticket = await Ticket.create({
      title,
      description,
      status: "open",
      createdBy: req.user.id,
    });

    const traceId = randomUUID();

    await AuditLog.create({
      ticketId: ticket._id,
      traceId,
      actor: "user",
      action: "TICKET_CREATED",
      meta: { title },
      timestamp: new Date(),
    });

    req.app.get("agent")?.triage(ticket._id, traceId).catch(console.error);

    res.status(201).json(ticket);
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ message: "Error creating ticket" });
  }
});

/**
 * GET all tickets
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    let tickets;
    if (req.user.role === "admin") {
      tickets = await Ticket.find().populate("createdBy", "name email");
    } else {
      tickets = await Ticket.find({ createdBy: req.user.id });
    }
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

/**
 * GET assigned tickets for agent
 */
router.get("/assigned", authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user._id });
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching assigned tickets:", err);
    res.status(500).json({ message: "Error fetching assigned tickets" });
  }
});

/**
 * GET single ticket by ID
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignee", "name email")
      .lean();

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.agentSuggestionId) {
      const sug = await AgentSuggestion.findById(ticket.agentSuggestionId);
      ticket.agentSuggestion = sug;
    }

    res.json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ message: "Error fetching ticket" });
  }
});

/**
 * UPDATE ticket (admin only)
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, assignee, category } = req.body;
    const updateFields = {};
    if (status) updateFields.status = status;
    if (assignee) updateFields.assignee = assignee;
    if (category) updateFields.category = category;

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    }).populate("createdBy", "name email");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json(ticket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ message: "Error updating ticket" });
  }
});

/**
 * POST reply to a ticket (agent, admin, or user)
 */
router.post("/:id/reply", authMiddleware, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || body.trim() === "") {
      return res.status(400).json({ message: "body is required" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const actor =
      req.user.role === "agent" || req.user.role === "admin" ? "agent" : "user";

    ticket.messages = ticket.messages || [];
    ticket.messages.push({ actor, body });

    if (actor === "agent") {
      ticket.status = "resolved"; // optionally let agent decide
    }

    await ticket.save();

    await AuditLog.create({
      ticketId: ticket._id,
      traceId: req.headers["x-trace-id"] || "manual",
      actor,
      action: "REPLY_SENT",
      meta: { snippet: body.slice(0, 200) },
      timestamp: new Date(),
    });

    res.json(ticket);
  } catch (err) {
    console.error("Error sending reply:", err);
    res.status(500).json({ message: "Error sending reply" });
  }
});

export default router;
