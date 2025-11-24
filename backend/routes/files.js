import express from "express";
import {
  uploadFileController,
  getFilesController,
  deleteFileController,
  saveFileController,
} from "../controllers/filesController.js";

const router = express.Router();

// POST /api/files/upload - Upload/save a file
router.post("/upload", uploadFileController);

// GET /api/files/:roomId - Get all files for a room
router.get("/:roomId", getFilesController);

// DELETE /api/files/delete - Delete a file
router.delete("/delete", deleteFileController);

// PUT /api/files/save - Update file content
router.put("/save", saveFileController);

export default router;
