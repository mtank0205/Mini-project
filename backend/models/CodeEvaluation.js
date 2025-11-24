import mongoose from "mongoose";

const codeEvaluationSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  code: {
    type: String,
    required: true,
  },
  fileName: String,
  language: String,
  scores: {
    readability: {
      type: Number,
      min: 0,
      max: 10,
    },
    structure: {
      type: Number,
      min: 0,
      max: 10,
    },
    maintainability: {
      type: Number,
      min: 0,
      max: 10,
    },
    correctness: {
      type: Number,
      min: 0,
      max: 10,
    },
    security: {
      type: Number,
      min: 0,
      max: 10,
    },
    bestPractices: {
      type: Number,
      min: 0,
      max: 10,
    },
    average: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  improvements: [String],
  securityIssues: [String],
  bestPracticesViolations: [String],
  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CodeEvaluation = mongoose.model("CodeEvaluation", codeEvaluationSchema);

export default CodeEvaluation;
