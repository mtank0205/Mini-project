import mongoose from "mongoose";

const ideaEvaluationSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  problemStatement: {
    type: String,
    required: true,
  },
  idea: {
    type: String,
    required: true,
  },
  features: [String],
  techStack: [String],
  scores: {
    innovation: {
      type: Number,
      min: 0,
      max: 10,
    },
    feasibility: {
      type: Number,
      min: 0,
      max: 10,
    },
    impact: {
      type: Number,
      min: 0,
      max: 10,
    },
    scalability: {
      type: Number,
      min: 0,
      max: 10,
    },
    clarity: {
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
  summary: String,
  improvements: [String],
  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
});

const IdeaEvaluation = mongoose.model("IdeaEvaluation", ideaEvaluationSchema);

export default IdeaEvaluation;
