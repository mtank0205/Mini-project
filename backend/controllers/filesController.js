import UserProjectData from "../models/UserProjectData.js";
import { sanitizeText } from "../utils/sanitizer.js";

/**
 * POST /api/files/upload
 * Upload/save a file to the room
 */
export const uploadFileController = async (req, res) => {
  try {
    const { roomId, fileName, fileContent, language } = req.body;

    if (!roomId || !fileName || !fileContent) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, fileName, fileContent",
      });
    }

    console.log(`📁 Uploading file: ${fileName} to room: ${roomId}`);

    const fileData = {
      fileName: sanitizeText(fileName),
      fileContent,
      language: language || "plaintext",
      uploadedBy: req.user?.id || null,
      uploadedAt: new Date(),
    };

    // Add file to UserProjectData
    const projectData = await UserProjectData.findOneAndUpdate(
      { roomId },
      {
        $push: { files: fileData },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ File uploaded successfully: ${fileName}`);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: fileData.fileName,
        uploadedAt: fileData.uploadedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in uploadFileController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message,
    });
  }
};

/**
 * GET /api/files/:roomId
 * Get all files for a room
 */
export const getFilesController = async (req, res) => {
  try {
    const { roomId } = req.params;

    const projectData = await UserProjectData.findOne({ roomId });

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: "No project data found for this room",
        data: { files: [] },
      });
    }

    console.log(`📂 Retrieved ${projectData.files?.length || 0} files for room: ${roomId}`);

    return res.status(200).json({
      success: true,
      message: "Files retrieved successfully",
      data: {
        files: projectData.files || [],
      },
    });
  } catch (error) {
    console.error("❌ Error in getFilesController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve files",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/files/:fileId
 * Delete a file from the room
 */
export const deleteFileController = async (req, res) => {
  try {
    const { roomId, fileName } = req.body;

    if (!roomId || !fileName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, fileName",
      });
    }

    console.log(`🗑️ Deleting file: ${fileName} from room: ${roomId}`);

    const projectData = await UserProjectData.findOneAndUpdate(
      { roomId },
      {
        $pull: { files: { fileName } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    console.log(`✅ File deleted successfully: ${fileName}`);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in deleteFileController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error.message,
    });
  }
};

/**
 * PUT /api/files/save
 * Update file content
 */
export const saveFileController = async (req, res) => {
  try {
    const { roomId, fileName, fileContent } = req.body;

    if (!roomId || !fileName || !fileContent) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, fileName, fileContent",
      });
    }

    console.log(`💾 Saving file: ${fileName} in room: ${roomId}`);

    const projectData = await UserProjectData.findOneAndUpdate(
      { roomId, "files.fileName": fileName },
      {
        $set: {
          "files.$.fileContent": fileContent,
          "files.$.uploadedAt": new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: "File not found. Please upload it first.",
      });
    }

    console.log(`✅ File saved successfully: ${fileName}`);

    return res.status(200).json({
      success: true,
      message: "File saved successfully",
    });
  } catch (error) {
    console.error("❌ Error in saveFileController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save file",
      error: error.message,
    });
  }
};

export default {
  uploadFileController,
  getFilesController,
  deleteFileController,
  saveFileController,
};
