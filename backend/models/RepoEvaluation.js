import mongoose from "mongoose";

const repoEvaluationSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  repoUrl: {
    type: String,
    required: true,
  },
  repoMetadata: {
    name: String,
    description: String,
    stars: Number,
    forks: Number,
    commitCount: Number,
    contributorCount: Number,
    languages: [String],
    mainLanguage: String,
    hasReadme: Boolean,
    lastUpdated: Date,
  },
  contributors: [{
    username: String,
    commits: Number,
  }],
  scores: {
    organization: {
      type: Number,
      min: 0,
      max: 10,
    },
    codeQuality: {
      type: Number,
      min: 0,
      max: 10,
    },
    documentation: {
      type: Number,
      min: 0,
      max: 10,
    },
    commitQuality: {
      type: Number,
      min: 0,
      max: 10,
    },
    contributorBalance: {
      type: Number,
      min: 0,
      max: 10,
    },
    projectMaturity: {
      type: Number,
      min: 0,
      max: 10,
    },
    techStackSuitability: {
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
  strengths: [String],
  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
});

const RepoEvaluation = mongoose.model("RepoEvaluation", repoEvaluationSchema);

export default RepoEvaluation;
