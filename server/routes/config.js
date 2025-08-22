import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Config from "../models/Config.js";

const router = express.Router();

// Get config (anyone can read)
router.get("/", async (_req, res) => {
  try {
    const cfg = (await Config.findOne()) || (await Config.create({}));
    res.json(cfg);
  } catch (err) {
    console.error("Error fetching config:", err);
    res.status(500).json({ message: "Error fetching config" });
  }
});

// Update config (admin only)
router.put("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const cfg = await Config.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });

    res.json(cfg);
  } catch (err) {
    console.error("Error updating config:", err);
    res.status(500).json({ message: "Error updating config" });
  }
});

export default router;
