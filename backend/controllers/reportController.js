import FinalReport from "../models/FinalReport.js";
import IdeaEvaluation from "../models/IdeaEvaluation.js";
import RepoEvaluation from "../models/RepoEvaluation.js";
import { compareIdeaAndRepo } from "../services/geminiService.js";
import { fetchCompleteRepoAnalysis } from "../services/githubService.js";
import { parseGitHubUrl } from "../utils/sanitizer.js";

/**
 * GET /api/report/latest
 * Generate unified report combining latest Idea + Repo evaluations with matching analysis
 */
export const getLatestReportController = async (req, res) => {
  try {
    const userId = req.user?.id;

    console.log(`📊 Generating latest report for user: ${userId || 'anonymous'}`);

    // Fetch latest evaluations - by userId if authenticated, otherwise get most recent overall
    const query = userId ? { userId } : {};
    const ideaEval = await IdeaEvaluation.findOne(query).sort({ evaluatedAt: -1 });
    const repoEval = await RepoEvaluation.findOne(query).sort({ evaluatedAt: -1 });

    // Check existence and provide clear messages
    if (!ideaEval && !repoEval) {
      return res.status(404).json({
        success: false,
        message: "No evaluations found. Please complete both Idea Evaluation and Repository Analysis first.",
      });
    }

    if (!ideaEval) {
      return res.status(400).json({
        success: false,
        message: "Idea evaluation not found. Please complete Idea Evaluation before generating the report.",
      });
    }

    if (!repoEval) {
      return res.status(400).json({
        success: false,
        message: "Repository analysis not found. Please complete Repository Analysis before generating the report.",
      });
    }

    // Both evaluations exist - proceed with comprehensive report generation
    console.log("🔍 Both evaluations found - generating comprehensive report...");

    // Fetch FRESH code from GitHub using the stored repo link
    console.log(`🔄 Fetching fresh code from repository: ${repoEval.repoUrl}`);
    const parsedUrl = parseGitHubUrl(repoEval.repoUrl);
    
    if (!parsedUrl) {
      return res.status(400).json({
        success: false,
        message: "Invalid repository URL in stored evaluation",
      });
    }

    // Fetch complete repo analysis with actual code
    const freshRepoData = await fetchCompleteRepoAnalysis(parsedUrl.owner, parsedUrl.repo);
    
    console.log("✅ Fresh repository data fetched:");
    console.log(`  - Files analyzed: ${freshRepoData.fileStructure?.length || 0}`);
    console.log(`  - Sample code fetched: ${freshRepoData.sampleFiles ? 'YES' : 'NO'}`);

    // OLD CODE - If only one evaluation exists, generate partial report
    if (false) {
      const partialReport = {
        userId,
        ideaEvaluationId: ideaEval?._id || null,
        repoEvaluationId: repoEval?._id || null,
        ideaRepoMatch: {
          matched: false,
          matchScore: 0,
          matchSummary: "Cannot compare - need both Idea Evaluation and Repository Analysis",
          discrepancies: [],
          alignments: [],
        },
        scores: {
          ideaScore: ideaEval?.scores.average || 0,
          repoScore: repoEval?.scores.average || 0,
          overallScore: ideaEval?.scores.average || repoEval?.scores.average || 0,
        },
        executiveSummary: ideaEval ? "Idea evaluated, awaiting repository submission." : "Repository analyzed, awaiting idea submission.",
        strengths: [
          ...(ideaEval?.summary ? [`Idea: ${ideaEval.summary}`] : []),
          ...(repoEval?.strengths || [])
        ],
        weaknesses: [],
        recommendations: [...(ideaEval?.improvements || []), ...(repoEval?.improvements || [])],
        finalVerdict: "Incomplete - submit both evaluations for full analysis.",
        generatedAt: new Date(),
      };

      return res.status(200).json({
        success: true,
        message: "Partial report generated",
        data: partialReport,
      });
    }

    // Both evaluations exist - compare them with FRESH code
    console.log("🔍 Comparing idea with fresh repository code...");

    const ideaData = {
      problemStatement: ideaEval.problemStatement,
      idea: ideaEval.idea,
      features: ideaEval.features,
      techStack: ideaEval.techStack,
    };

    // Use FRESH fetched data for more accurate comparison
    const repoData = {
      languages: freshRepoData.repoMetadata?.languages || [],
      fileCount: freshRepoData.repoMetadata?.fileCount || 0,
      structure: freshRepoData.repoMetadata?.structure || {},
      readmeContent: freshRepoData.readmeContent || freshRepoData.repoMetadata?.description || "",
      fileStructure: freshRepoData.fileStructure || [],
      sampleFiles: freshRepoData.sampleFiles || "",
    };

    const matchResult = await compareIdeaAndRepo(ideaData, repoData);

    // Calculate overall score (weighted average with match penalty)
    const ideaScore = ideaEval.scores.average;
    const repoScore = repoEval.scores.average;
    const matchPenalty = matchResult.matchScore < 70 ? (70 - matchResult.matchScore) * 0.2 : 0;
    const overallScore = Math.max(0, ((ideaScore * 0.4) + (repoScore * 0.6) - matchPenalty).toFixed(2));

    // Generate unified analysis
    const executiveSummary = `
Idea Score: ${ideaScore}/10 | Repo Score: ${repoScore}/10 | Match: ${matchResult.matchScore}%
${matchResult.executiveSummary}
Overall: ${matchResult.matched ? "Project aligns with proposal" : "Significant discrepancies detected"}.
`.trim();

    // Build strengths array (IdeaEval doesn't have strengths field)
    const strengths = [
      ...(repoEval.strengths || []),
      ...matchResult.alignments.map(a => `✓ ${a}`),
    ];
    
    // Add idea summary as a strength if available
    if (ideaEval.summary) {
      strengths.unshift(`Idea: ${ideaEval.summary}`);
    }

    // Build weaknesses array (from discrepancies)
    const weaknesses = [
      ...matchResult.discrepancies.map(d => `✗ ${d}`),
    ];

    const recommendations = [
      ...new Set([...(ideaEval.improvements || []), ...(repoEval.improvements || [])]),
    ];

    const finalVerdict = matchResult.matched && overallScore >= 70
      ? "Strong project - idea and implementation align well. Ready for presentation."
      : matchResult.matched
      ? "Decent effort - implementation matches idea but needs improvements."
      : "Major issues - significant mismatch between proposal and implementation.";

    // Save to database
    const finalReport = new FinalReport({
      userId,
      ideaEvaluationId: ideaEval._id,
      repoEvaluationId: repoEval._id,
      ideaRepoMatch: {
        matched: matchResult.matched,
        matchScore: matchResult.matchScore,
        matchSummary: matchResult.matchSummary,
        discrepancies: matchResult.discrepancies,
        alignments: matchResult.alignments,
      },
      scores: {
        ideaScore: parseFloat(ideaScore),
        repoScore: parseFloat(repoScore),
        overallScore: parseFloat(overallScore),
      },
      executiveSummary,
      strengths,
      weaknesses,
      recommendations,
      finalVerdict,
    });

    await finalReport.save();

    console.log(`✅ Latest report generated for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Unified report generated successfully",
      data: {
        reportId: finalReport._id,
        ideaRepoMatch: finalReport.ideaRepoMatch,
        scores: finalReport.scores,
        executiveSummary: finalReport.executiveSummary,
        strengths: finalReport.strengths,
        weaknesses: finalReport.weaknesses,
        recommendations: finalReport.recommendations,
        finalVerdict: finalReport.finalVerdict,
        generatedAt: finalReport.generatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in getLatestReportController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};

/**
 * Generate a unique random seed for anti-plagiarism
 * @param {string} roomId - Room identifier
 * @returns {string} - Unique seed
 */
const generateUniqueSeed = (roomId) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString("hex");
  return `${roomId}-${timestamp}-${random}`;
};

/**
 * Determine style variant based on seed
 * @param {string} seed - Random seed
 * @returns {string} - Style variant
 */
const getStyleVariant = (seed) => {
  const variants = [
    "professional",
    "encouraging",
    "technical",
    "conversational",
    "analytical",
  ];
  const hash = crypto.createHash("md5").update(seed).digest("hex");
  const index = parseInt(hash.substring(0, 8), 16) % variants.length;
  return variants[index];
};

/**
 * POST /api/report/generate
 * Generate final comprehensive report with anti-plagiarism features
 */
export const generateReportController = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: roomId",
      });
    }

    console.log(`📊 Generating final report for room: ${roomId}`);

    // Check if report already exists
    const existingReport = await FinalReport.findOne({ roomId });
    if (existingReport) {
      console.log(`📄 Report already exists for room: ${roomId}`);
      return res.status(200).json({
        success: true,
        message: "Report retrieved successfully",
        data: existingReport,
      });
    }

    // Fetch all evaluations
    const ideaEval = await IdeaEvaluation.findOne({ roomId }).sort({ evaluatedAt: -1 });
    const codeEval = await CodeEvaluation.findOne({ roomId }).sort({ evaluatedAt: -1 });
    const repoEval = await RepoEvaluation.findOne({ roomId }).sort({ evaluatedAt: -1 });

    if (!ideaEval && !codeEval && !repoEval) {
      return res.status(404).json({
        success: false,
        message: "No evaluations found. Please complete at least one evaluation first.",
      });
    }

    // Calculate weighted scores
    const weights = {
      idea: 0.4,
      code: 0.35,
      repo: 0.25,
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

    // Generate unique context for anti-plagiarism
    const uniqueSeed = generateUniqueSeed(roomId);
    const styleVariant = getStyleVariant(uniqueSeed);

    // Generate judge comments using Gemini AI
    const judgeData = await generateJudgeComments(
      {
        ideaScore,
        codeScore,
        repoScore,
        finalScore,
      },
      `${uniqueSeed}-${styleVariant}`
    );

    // Compile improvements from all evaluations
    const allImprovements = [
      ...(ideaEval?.improvements || []),
      ...(codeEval?.improvements || []),
      ...(repoEval?.improvements || []),
    ];

    // Compile strengths
    const allStrengths = [
      ...(repoEval?.strengths || []),
      ...(judgeData.strengths || []),
    ];

    // Create final report
    const finalReport = new FinalReport({
      roomId,
      userId: req.user?.id || null,
      ideaEvaluationId: ideaEval?._id || null,
      codeEvaluationId: codeEval?._id || null,
      repoEvaluationId: repoEval?._id || null,
      scores: {
        ideaScore: parseFloat(ideaScore),
        codeScore: parseFloat(codeScore),
        repoScore: parseFloat(repoScore),
        finalScore: parseFloat(finalScore),
      },
      weights,
      judgeComments: judgeData.judgeComments,
      strengths: allStrengths,
      weaknesses: judgeData.weaknesses || [],
      improvements: [...new Set(allImprovements)], // Remove duplicates
      suggestedNextSteps: judgeData.suggestedNextSteps || [],
      uniqueContext: {
        randomSeed: uniqueSeed,
        generationTimestamp: new Date(),
        styleVariant,
      },
    });

    await finalReport.save();

    // Update UserProjectData
    await UserProjectData.findOneAndUpdate(
      { roomId },
      {
        $set: {
          "evaluations.finalReportId": finalReport._id,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Final report generated for room: ${roomId}`);

    return res.status(200).json({
      success: true,
      message: "Final report generated successfully",
      data: {
        reportId: finalReport._id,
        scores: finalReport.scores,
        weights: finalReport.weights,
        judgeComments: finalReport.judgeComments,
        strengths: finalReport.strengths,
        weaknesses: finalReport.weaknesses,
        improvements: finalReport.improvements,
        suggestedNextSteps: finalReport.suggestedNextSteps,
        generatedAt: finalReport.generatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in generateReportController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};

/**
 * GET /api/report/:roomId
 * Retrieve existing report for a room
 */
export const getReportController = async (req, res) => {
  try {
    const { roomId } = req.params;

    const report = await FinalReport.findOne({ roomId })
      .populate("ideaEvaluationId")
      .populate("codeEvaluationId")
      .populate("repoEvaluationId");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "No report found for this room",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("❌ Error in getReportController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve report",
      error: error.message,
    });
  }
};


export default {
  generateReportController,
  getReportController,
  getLatestReportController,
};
