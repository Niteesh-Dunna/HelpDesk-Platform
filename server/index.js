import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";
import kbRoutes from "./routes/kb.js";
import agentRoutes from "./routes/agent.js";
import auditRoutes from "./routes/audit.js";
import configRoutes from "./routes/config.js";

import makeAgent from "./services/agent.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/kb", kbRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api", auditRoutes); // exposes: GET /api/tickets/:id/audit
app.use("/api/config", configRoutes);

// Health check (optional)
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

// DB + Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Create agent service and attach to app
    const agent = makeAgent();
    app.set("agent", agent);

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error(err));
