import mongoose from "mongoose";

const userProjectDataSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  roomName: String,
  teamMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    email: String,
    role: String,
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  projectData: {
    problemStatement: String,
    idea: String,
    features: [String],
    techStack: [String],
    repoUrl: String,
  },
  files: [{
    fileName: String,
    fileContent: String,
    language: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  evaluations: {
    ideaEvaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IdeaEvaluation",
    },
    codeEvaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeEvaluation",
    },
    repoEvaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepoEvaluation",
    },
    finalReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinalReport",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
userProjectDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserProjectData = mongoose.model("UserProjectData", userProjectDataSchema);

export default UserProjectData;
