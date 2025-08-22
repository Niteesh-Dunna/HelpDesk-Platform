import express from "express";
import KB from "../models/KB.js"; // your KB schema
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// CREATE KB
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { title, body, tags, status } = req.body;
    const kb = new KB({ title, body, tags, status });
    await kb.save();
    res.json(kb);
  } catch (err) {
    console.error("Error creating KB:", err);
    res.status(500).json({ message: "Error creating KB" });
  }
});

// READ KBs with search across title/body/tags
router.get("/", async (req, res) => {
  try {
    const query = req.query.query?.trim() || "";
    const condition = query
      ? {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { body: { $regex: query, $options: "i" } },
            { tags: { $elemMatch: { $regex: query, $options: "i" } } },
          ],
        }
      : {};

    const kbs = await KB.find(condition);
    res.json(kbs);
  } catch (err) {
    console.error("Error fetching KBs:", err);
    res.status(500).json({ message: "Error fetching KBs" });
  }
});

// UPDATE KB
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { title, body, tags, status } = req.body;
    const kb = await KB.findByIdAndUpdate(
      req.params.id,
      { title, body, tags, status },
      { new: true }
    );
    res.json(kb);
  } catch (err) {
    console.error("Error updating KB:", err);
    res.status(500).json({ message: "Error updating KB" });
  }
});

// DELETE KB
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    await KB.findByIdAndDelete(req.params.id);
    res.json({ message: "KB deleted" });
  } catch (err) {
    console.error("Error deleting KB:", err);
    res.status(500).json({ message: "Error deleting KB" });
  }
});

export default router;
