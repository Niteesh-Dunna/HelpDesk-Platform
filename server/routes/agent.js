import express from "express";
import AgentSuggestion from "../models/AgentSuggestion.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/agent/triage
 * Manually trigger triage for a ticket (mainly for testing)
 */
router.post("/triage", authMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ message: "ticketId required" });
    }

    // call agent service asynchronously
    req.app.get("agent").triage(ticketId).catch(console.error);

    res.json({ ok: true, message: "Triage triggered" });
  } catch (err) {
    console.error("Error triggering triage:", err);
    res.status(500).json({ message: "Error triggering triage" });
  }
});

/**
 * GET /api/agent/suggestion/:ticketId
 * Fetch latest suggestion for a ticket
 */
router.get("/suggestion/:ticketId", authMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.params;

    const suggestion = await AgentSuggestion.findOne({ ticketId }).sort({
      createdAt: -1,
    });

    if (!suggestion) {
      return res.status(404).json({ message: "No suggestion found" });
    }

    res.json(suggestion);
  } catch (err) {
    console.error("Error fetching suggestion:", err);
    res.status(500).json({ message: "Error fetching suggestion" });
  }
});

export default router;
