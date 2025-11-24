import express from "express";
import {
  evaluateIdeaController,
  evaluateCodeController,
  evaluateRepoController,
  calculateFinalScoreController,
} from "../controllers/evaluationController.js";

const router = express.Router();

// POST /api/evaluate/idea - Evaluate hackathon idea
router.post("/idea", evaluateIdeaController);

// POST /api/evaluate/code - Evaluate code quality
router.post("/code", evaluateCodeController);

// POST /api/evaluate/repo - Evaluate GitHub repository
router.post("/repo", evaluateRepoController);

// POST /api/evaluate/final - Calculate final combined score
router.post("/final", calculateFinalScoreController);

export default router;
