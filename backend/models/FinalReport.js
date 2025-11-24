import mongoose from "mongoose";

const finalReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  ideaEvaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IdeaEvaluation",
    default: null,
  },
  repoEvaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RepoEvaluation",
    default: null,
  },
  // Idea-Repo Matching Analysis
  ideaRepoMatch: {
    matched: { type: Boolean, default: false },
    matchScore: { type: Number, default: 0 }, // 0-100
    matchSummary: { type: String, default: "" },
    discrepancies: [{ type: String }],
    alignments: [{ type: String }],
  },
  // Combined Scores
  scores: {
    ideaScore: { type: Number, min: 0, max: 10, default: 0 },
    repoScore: { type: Number, min: 0, max: 10, default: 0 },
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
  },
  // AI-Generated Report
  executiveSummary: { type: String, default: "" },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  recommendations: [{ type: String }],
  finalVerdict: { type: String, default: "" },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries - get latest report per user
finalReportSchema.index({ userId: 1, createdAt: -1 });
// Note: No unique constraint on roomId - allows multiple reports with null roomId

const FinalReport = mongoose.model("FinalReport", finalReportSchema);

export default FinalReport;
