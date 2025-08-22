import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    traceId: { type: String, required: true, index: true },
    actor: { type: String, enum: ["system", "agent", "user"], required: true },
    action: { type: String, required: true }, // e.g., AGENT_CLASSIFIED, KB_RETRIEVED
    meta: { type: Object, default: {} },
    timestamp: { type: Date, default: () => new Date() },
  },
  { versionKey: false }
);

export default mongoose.model("AuditLog", auditLogSchema);
