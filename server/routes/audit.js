import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Get audit timeline for a ticket
router.get("/tickets/:id/audit", authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.find({ ticketId: req.params.id }).sort({
      timestamp: 1,
    });
    res.json(logs);
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ message: "Error fetching audit logs" });
  }
});

export default router;
