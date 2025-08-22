// server/models/Ticket.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    actor: { type: String, enum: ["user", "agent", "system"], required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["billing", "tech", "shipping", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "triaged", "waiting_human", "resolved", "closed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agentSuggestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentSuggestion",
    },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
