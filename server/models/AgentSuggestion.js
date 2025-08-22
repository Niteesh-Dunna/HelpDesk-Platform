import mongoose from "mongoose";

const agentSuggestionSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    predictedCategory: { type: String, required: true },
    articleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "KB" }],
    draftReply: { type: String },
    confidence: { type: Number, default: 0 },
    autoClosed: { type: Boolean, default: false },
    modelInfo: {
      provider: String,
      model: String,
      promptVersion: String,
      stub: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AgentSuggestion", agentSuggestionSchema);
