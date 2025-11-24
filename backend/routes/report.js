import express from "express";
import {
  generateReportController,
  getReportController,
  getLatestReportController,
} from "../controllers/reportController.js";

const router = express.Router();

// GET /api/report/latest - Generate unified report (Idea + Repo with matching)
router.get("/latest", getLatestReportController);

// POST /api/report/generate - Generate final comprehensive report
router.post("/generate", generateReportController);

// GET /api/report/:roomId - Get existing report for a room
router.get("/:roomId", getReportController);

export default router;
