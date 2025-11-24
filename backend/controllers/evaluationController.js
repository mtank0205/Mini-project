import IdeaEvaluation from "../models/IdeaEvaluation.js";
import CodeEvaluation from "../models/CodeEvaluation.js";
import RepoEvaluation from "../models/RepoEvaluation.js";
import UserProjectData from "../models/UserProjectData.js";
import { evaluateIdea, evaluateCode, evaluateRepository } from "../services/geminiService.js";
import { fetchCompleteRepoAnalysis } from "../services/githubService.js";
import { sanitizeIdeaInput, sanitizeCode, validateInput, parseGitHubUrl } from "../utils/sanitizer.js";

/**
 * POST /api/evaluate/idea
 * Evaluate a hackathon idea
 */
export const evaluateIdeaController = async (req, res) => {
  try {
    const { roomId, problemStatement, idea, features, techStack } = req.body;

    // Validate inputs
    if (!roomId || !problemStatement || !idea) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, problemStatement, idea",
      });
    }

    if (!validateInput(problemStatement, 5000) || !validateInput(idea, 5000)) {
      return res.status(400).json({
        success: false,
        message: "Input too long or contains invalid characters",
      });
    }

    // Sanitize input
    const sanitizedData = sanitizeIdeaInput({
      problemStatement,
      idea,
      features: features || [],
      techStack: techStack || [],
    });

    console.log(`💡 Evaluating idea for room: ${roomId}`);

    // Delete previous idea evaluation for this user (keep only most recent)
    const userId = req.user?.id || null;
    if (userId) {
      await IdeaEvaluation.deleteMany({ userId });
      console.log(`🗑️ Deleted previous idea evaluations for user: ${userId}`);
    }

    // Call Gemini AI to evaluate
    const evaluation = await evaluateIdea(sanitizedData);

    // Save to database
    const ideaEvaluation = new IdeaEvaluation({
      roomId,
      userId: req.user?.id || null,
      problemStatement: sanitizedData.problemStatement,
      idea: sanitizedData.idea,
      features: sanitizedData.features,
      techStack: sanitizedData.techStack,
      scores: {
        innovation: evaluation.innovation,
        feasibility: evaluation.feasibility,
        impact: evaluation.impact,
        scalability: evaluation.scalability,
        clarity: evaluation.clarity,
        average: evaluation.average,
      },
      summary: evaluation.summary,
      improvements: evaluation.improvements,
    });

    await ideaEvaluation.save();

    // Update UserProjectData
    await UserProjectData.findOneAndUpdate(
      { roomId },
      {
        $set: {
          "projectData.problemStatement": sanitizedData.problemStatement,
          "projectData.idea": sanitizedData.idea,
          "projectData.features": sanitizedData.features,
          "projectData.techStack": sanitizedData.techStack,
          "evaluations.ideaEvaluationId": ideaEvaluation._id,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Idea evaluation completed for room: ${roomId}`);

    return res.status(200).json({
      success: true,
      message: "Idea evaluated successfully",
      data: {
        evaluationId: ideaEvaluation._id,
        scores: ideaEvaluation.scores,
        summary: ideaEvaluation.summary,
        improvements: ideaEvaluation.improvements,
      },
    });
  } catch (error) {
    console.error("❌ Error in evaluateIdeaController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to evaluate idea",
      error: error.message,
    });
  }
};

/**
 * POST /api/evaluate/code
 * Evaluate code quality
 */
export const evaluateCodeController = async (req, res) => {
  try {
    const { roomId, code, fileName, language } = req.body;

    // Validate inputs
    if (!roomId || !code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, code",
      });
    }

    if (!validateInput(code, 100000)) {
      return res.status(400).json({
        success: false,
        message: "Code too long or contains invalid characters",
      });
    }

    console.log(`💻 Evaluating code for room: ${roomId}`);

    // Sanitize code (remove API keys, secrets, etc.)
    const sanitizedCode = sanitizeCode(code);

    // Call Gemini AI to evaluate
    const evaluation = await evaluateCode({
      code: sanitizedCode,
      fileName: fileName || "code.js",
      language: language || "javascript",
    });

    console.log("📊 Evaluation result:", JSON.stringify(evaluation, null, 2));

    // Save to database
    const codeEvaluation = new CodeEvaluation({
      roomId,
      userId: req.user?.id || null,
      code: sanitizedCode,
      fileName: fileName || "code.js",
      language: language || "javascript",
      scores: {
        readability: evaluation.readability || 5,
        structure: evaluation.structure || 5,
        maintainability: evaluation.maintainability || 5,
        correctness: evaluation.correctness || 5,
        security: evaluation.security || 5,
        bestPractices: evaluation.bestPractices || 5,
        average: evaluation.average || "5.00",
      },
      improvements: evaluation.improvements || evaluation.suggestions || [],
      securityIssues: evaluation.securityIssues || [],
      bestPracticesViolations: evaluation.bestPracticesViolations || [],
    });

    await codeEvaluation.save();

    // Update UserProjectData
    await UserProjectData.findOneAndUpdate(
      { roomId },
      {
        $set: {
          "evaluations.codeEvaluationId": codeEvaluation._id,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Code evaluation completed for room: ${roomId}`);

    // Return data in format expected by frontend
    return res.status(200).json({
      success: true,
      message: "Code evaluated successfully",
      data: {
        evaluationId: codeEvaluation._id,
        detectedLanguage: evaluation.detectedLanguage || "Unknown",
        codeQuality: evaluation.codeQuality || 5,
        readability: evaluation.readability || 5,
        maintainability: evaluation.maintainability || 5,
        performance: evaluation.performance || 5,
        security: evaluation.security || 5,
        bestPractices: evaluation.bestPractices || 5,
        average: evaluation.average || "5.00",
        summary: evaluation.summary || "Code analysis completed",
        suggestions: evaluation.suggestions || evaluation.improvements || [],
        scores: {
          codeQuality: evaluation.codeQuality || 5,
          average: evaluation.average || "5.00",
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in evaluateCodeController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to evaluate code",
      error: error.message,
    });
  }
};

/**
 * POST /api/evaluate/repo
 * Evaluate GitHub repository
 */
export const evaluateRepoController = async (req, res) => {
  try {
    const { roomId, repoUrl } = req.body;

    // Validate inputs
    if (!roomId || !repoUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, repoUrl",
      });
    }

    // Parse GitHub URL
    const parsedUrl = parseGitHubUrl(repoUrl);
    if (!parsedUrl) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub repository URL",
      });
    }

    console.log(`📦 Evaluating repository: ${parsedUrl.owner}/${parsedUrl.repo}`);

    // Delete previous repo evaluation for this user (keep only most recent)
    const userId = req.user?.id || null;
    if (userId) {
      await RepoEvaluation.deleteMany({ userId });
      console.log(`🗑️ Deleted previous repo evaluations for user: ${userId}`);
    }

    // Fetch repository data from GitHub
    const repoData = await fetchCompleteRepoAnalysis(parsedUrl.owner, parsedUrl.repo);

    // Call Gemini AI to evaluate
    const evaluation = await evaluateRepository(repoData);

    // Save to database
    const repoEvaluation = new RepoEvaluation({
      roomId,
      userId: req.user?.id || null,
      repoUrl,
      repoMetadata: repoData.repoMetadata,
      contributors: repoData.contributors,
      scores: {
        organization: evaluation.organization,
        codeQuality: evaluation.codeQuality,
        documentation: evaluation.documentation,
        commitQuality: evaluation.commitQuality,
        contributorBalance: evaluation.contributorBalance,
        projectMaturity: evaluation.projectMaturity,
        techStackSuitability: evaluation.techStackSuitability,
        average: evaluation.average,
      },
      improvements: evaluation.improvements || [],
      strengths: evaluation.strengths || [],
    });

    await repoEvaluation.save();

    // Update UserProjectData
    await UserProjectData.findOneAndUpdate(
      { roomId },
      {
        $set: {
          "projectData.repoUrl": repoUrl,
          "evaluations.repoEvaluationId": repoEvaluation._id,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Repository evaluation completed for room: ${roomId}`);

    return res.status(200).json({
      success: true,
      message: "Repository evaluated successfully",
      data: {
        evaluationId: repoEvaluation._id,
        repoMetadata: repoEvaluation.repoMetadata,
        scores: repoEvaluation.scores,
        improvements: repoEvaluation.improvements,
        strengths: repoEvaluation.strengths,
      },
    });
  } catch (error) {
    console.error("❌ Error in evaluateRepoController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to evaluate repository",
      error: error.message,
    });
  }
};

/**
 * POST /api/evaluate/final
 * Calculate final combined score
 */
export const calculateFinalScoreController = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: roomId",
      });
    }

    console.log(`🏆 Calculating final score for room: ${roomId}`);

    // Fetch all evaluations for this room
    const ideaEval = await IdeaEvaluation.findOne({ roomId }).sort({ evaluatedAt: -1 });
    const codeEval = await CodeEvaluation.findOne({ roomId }).sort({ evaluatedAt: -1 });
    const repoEval = await RepoEvaluation.findOne({ roomId }).sort({ evaluatedAt: -1 });

    if (!ideaEval && !codeEval && !repoEval) {
      return res.status(404).json({
        success: false,
        message: "No evaluations found for this room. Please complete at least one evaluation first.",
      });
    }

    // Calculate weighted final score
    const weights = {
      idea: 0.4,  // 40%
      code: 0.35, // 35%
      repo: 0.25, // 25%
    };

    const ideaScore = ideaEval?.scores.average || 0;
    const codeScore = codeEval?.scores.average || 0;
    const repoScore = repoEval?.scores.average || 0;

    // Adjust weights if some evaluations are missing
    let totalWeight = 0;
    if (ideaEval) totalWeight += weights.idea;
    if (codeEval) totalWeight += weights.code;
    if (repoEval) totalWeight += weights.repo;

    const finalScore = (
      (ideaScore * (ideaEval ? weights.idea : 0) +
        codeScore * (codeEval ? weights.code : 0) +
        repoScore * (repoEval ? weights.repo : 0)) /
      totalWeight
    ).toFixed(2);

    console.log(`✅ Final score calculated: ${finalScore}/10`);

    return res.status(200).json({
      success: true,
      message: "Final score calculated successfully",
      data: {
        scores: {
          ideaScore: parseFloat(ideaScore),
          codeScore: parseFloat(codeScore),
          repoScore: parseFloat(repoScore),
          finalScore: parseFloat(finalScore),
        },
        weights: {
          ideaWeight: weights.idea,
          codeWeight: weights.code,
          repoWeight: weights.repo,
        },
        breakdown: {
          ideaContribution: (ideaScore * weights.idea).toFixed(2),
          codeContribution: (codeScore * weights.code).toFixed(2),
          repoContribution: (repoScore * weights.repo).toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in calculateFinalScoreController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate final score",
      error: error.message,
    });
  }
};

export default {
  evaluateIdeaController,
  evaluateCodeController,
  evaluateRepoController,
  calculateFinalScoreController,
};
