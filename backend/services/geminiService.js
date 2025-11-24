import { GoogleGenerativeAI } from "@google/generative-ai";
import ollama from "ollama";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini AI (fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || "ollama";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

// Debug: Log AI configuration
console.log(`🤖 AI Provider: ${AI_PROVIDER}`);
if (AI_PROVIDER === "ollama") {
  console.log(`🦙 Ollama Host: ${OLLAMA_HOST}`);
  console.log(`🦙 Ollama Model: ${OLLAMA_MODEL}`);
} else {
  console.log("🔑 Gemini API Key loaded:", process.env.GEMINI_API_KEY?.substring(0, 20) + "...");
}

/**
 * Call Ollama API
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The AI response
 */
const callOllama = async (prompt) => {
  try {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages: [{ role: "user", content: prompt }],
      options: {
        temperature: 0.7,
      },
    });
    return response.message.content;
  } catch (error) {
    console.error("❌ Ollama API Error:", error.message);
    throw error;
  }
};

/**
 * Call Gemini API (fallback)
 * @param {string} prompt - The prompt to send
 * @param {string} modelName - The model to use
 * @returns {Promise<string>} - The AI response
 */
const callGemini = async (prompt, modelName = "gemini-2.5-flash") => {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    throw error;
  }
};

/**
 * Universal AI call with automatic fallback
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The AI response
 */
const callAI = async (prompt) => {
  if (AI_PROVIDER === "ollama") {
    try {
      return await callOllama(prompt);
    } catch (error) {
      console.warn("⚠️ Ollama failed, falling back to Gemini...");
      return await callGemini(prompt);
    }
  } else {
    return await callGemini(prompt);
  }
};

/**
 * Evaluate a hackathon idea
 * @param {Object} ideaData - { problemStatement, idea, features, techStack }
 * @returns {Promise<Object>} - Evaluation scores and feedback
 */
export const evaluateIdea = async (ideaData) => {
  const { problemStatement, idea, features, techStack } = ideaData;

  const prompt = `
You are a HIGHLY EXPERIENCED hackathon judge with 15+ years evaluating 10,000+ projects. You've judged at MIT, Stanford, and top-tier hackathons worldwide.
You are CRITICAL, HONEST, and have EXTREMELY HIGH STANDARDS. You care about helping teams succeed, so you give BRUTALLY HONEST feedback.

**Problem Statement:**
${problemStatement}

**Proposed Idea:**
${idea}

**Features:**
${features.join(", ")}

**Tech Stack:**
${techStack.join(", ")}

CRITICAL ANALYSIS REQUIRED:
1. Is this idea TRULY innovative or just another clone?
2. Can this REALISTICALLY be built in 24-48 hours by a small team?
3. Does this solve a SIGNIFICANT problem affecting MANY people?
4. Will this scale beyond 100 users without major infrastructure?
5. Is the problem statement clear and well-defined?

**FEEDBACK REQUIREMENTS:**
- Provide AT LEAST 3-5 specific strengths (not generic praise)
- Provide AT LEAST 3-5 actionable improvements (with concrete suggestions)
- Provide AT LEAST 2-3 concerns (with explanations of why they matter)
- Each item should be detailed and specific to THIS idea, not generic advice
- Use technical terms where appropriate (e.g., "API rate limiting", "database indexing", "caching strategy")

**OUTPUT FORMAT (JSON only, no markdown):**

{
  "innovation": <score 0-10>,
  "feasibility": <score 0-10>,
  "impact": <score 0-10>,
  "scalability": <score 0-10>,
  "clarity": <score 0-10>,
  "summary": "<2-3 sentences of HONEST, DIRECT feedback. Be encouraging but realistic. Point out the biggest concern.>",
  "strengths": [
    "<specific strength #1 with details>",
    "<specific strength #2 with details>",
    "<specific strength #3 with details>",
    "<additional strengths if applicable>"
  ],
  "improvements": [
    "<specific improvement #1 with actionable advice>",
    "<specific improvement #2 with actionable advice>",
    "<specific improvement #3 with actionable advice>",
    "<additional improvements if applicable>"
  ],
  "concerns": [
    "<major concern #1 with explanation>",
    "<major concern #2 with explanation>",
    "<major concern #3 with explanation>",
    "<additional concerns if applicable>"
  ]
}

STRICT SCORING GUIDELINES (Follow EXACTLY):

**Innovation (0-10):**
- 9-10: Completely novel approach, never seen before, unique angle
- 7-8: Fresh take on existing problem, creative solution
- 5-6: Somewhat unique but similar solutions exist
- 3-4: Common idea with minor tweaks
- 1-2: Clone of existing popular apps/services

**Feasibility (0-10):**
- 9-10: Can definitely be built in 24-48 hours, clear MVP scope
- 7-8: Achievable with focused effort, realistic feature set
- 5-6: Challenging but possible if scope is reduced
- 3-4: Overly ambitious, requires cutting major features
- 1-2: Impossible in hackathon timeframe, requires weeks/months

**Impact (0-10):**
- 9-10: Solves major problem affecting millions, high social/business value
- 7-8: Addresses real pain point for significant user base
- 5-6: Useful but limited audience or moderate problem
- 3-4: Nice-to-have, not critical, niche use case
- 1-2: Trivial problem or no clear user benefit

**Scalability (0-10):**
- 9-10: Well-architected, uses scalable tech, can handle 100K+ users
- 7-8: Good foundation, minor optimizations needed for scale
- 5-6: Works for demo but needs refactoring for production
- 3-4: Will break with moderate traffic, poor architecture
- 1-2: Not scalable, uses inefficient approach, will fail quickly

**Clarity (0-10):**
- 9-10: Crystal clear problem, solution, features, and technical approach
- 7-8: Well-defined with minor ambiguities
- 5-6: Generally clear but missing some details
- 3-4: Vague descriptions, unclear technical implementation
- 1-2: Confusing, contradictory, or severely lacking detail

RED FLAGS (Must result in LOW scores):
- "Todo app", "Reminder app", "Chat app", "Social media clone" → Innovation: 2-3/10
- "Uses AI" without specifying model, training, or integration → Clarity: 3/10
- Requires complex ML/blockchain/distributed systems → Feasibility: 2-4/10
- Problem solved by Google/Apple/Microsoft products → Innovation: 2/10, Impact: 3/10
- Features like "dark mode", "notifications", "share" without core value → Impact: 4/10
- MongoDB + Node.js for high-traffic app without caching → Scalability: 4/10
- No mention of API design, data models, or architecture → Clarity: 3-4/10

GREEN FLAGS (Can justify HIGH scores):
- Solves specific pain point with measurable impact
- Uses appropriate, proven tech stack
- Has clear MVP with stretch goals
- Considers edge cases and error handling
- Has realistic timeline and milestones
- Demonstrates market research or user validation

BE HONEST: Most ideas score 4-6/10. Only exceptional ideas get 8+/10.
`;

  const response = await callAI(prompt);

  // Parse JSON response
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const evaluation = JSON.parse(jsonMatch[0]);

    // Validate and ensure all scores are numbers
    const validateScore = (score) => {
      const num = parseFloat(score);
      return isNaN(num) ? 5 : Math.max(0, Math.min(10, num));
    };

    evaluation.innovation = validateScore(evaluation.innovation);
    evaluation.feasibility = validateScore(evaluation.feasibility);
    evaluation.impact = validateScore(evaluation.impact);
    evaluation.scalability = validateScore(evaluation.scalability);
    evaluation.clarity = validateScore(evaluation.clarity);

    // Ensure required fields exist
    evaluation.summary = evaluation.summary || "No summary provided";
    evaluation.improvements = Array.isArray(evaluation.improvements) && evaluation.improvements.length > 0
      ? evaluation.improvements
      : ["Define a clearer MVP scope with specific deliverables", "Consider using proven technologies to reduce implementation risk", "Research existing solutions to identify differentiation opportunities", "Add more technical details about architecture and data flow"];
    evaluation.strengths = Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0
      ? evaluation.strengths
      : ["Idea has been submitted for evaluation", "Problem statement is identified", "Tech stack considerations are mentioned"];
    evaluation.concerns = Array.isArray(evaluation.concerns) && evaluation.concerns.length > 0
      ? evaluation.concerns
      : ["Ensure feasibility within hackathon timeframe"];

    // Calculate average score
    // Calculate weighted average score
    // Innovation (30%), Impact (25%), Feasibility (20%), Clarity (15%), Scalability (10%)
    evaluation.average = (
      (evaluation.innovation * 0.30) +
      (evaluation.impact * 0.25) +
      (evaluation.feasibility * 0.20) +
      (evaluation.clarity * 0.15) +
      (evaluation.scalability * 0.10)
    ).toFixed(2);

    return evaluation;
  } catch (error) {
    console.error("❌ Failed to parse AI response:", error.message);
    console.error("Response was:", response.substring(0, 500));
    throw new Error("Invalid response format from AI");
  }
};

/**
 * Evaluate code quality
 * @param {Object} codeData - { code, fileName, language }
 * @returns {Promise<Object>} - Code quality scores and feedback
 */
export const evaluateCode = async (codeData) => {
  const { code, fileName = "code.js", language = "javascript" } = codeData;

  const prompt = `
You are a RUTHLESS senior code reviewer with 20+ years of experience. You have ZERO tolerance for mediocre code. Your reviews are HARSH but FAIR.

**File Name:** ${fileName}

**Code to Analyze:**
\`\`\`
${code}
\`\`\`

CRITICAL TASKS:
1. DETECT the programming language used in the code
2. Be BRUTALLY HONEST about code quality - most code is mediocre and deserves harsh criticism
3. Point out EVERY flaw, no matter how small
4. Give 3-5 specific, actionable improvements (be harsh but helpful)

Respond with ONLY valid JSON (no markdown, no extra text):

{
  "detectedLanguage": "<actual programming language detected>",
  "codeQuality": <score 0-10>,
  "readability": <score 0-10>,
  "maintainability": <score 0-10>,
  "performance": <score 0-10>,
  "security": <score 0-10>,
  "bestPractices": <score 0-10>,
  "summary": "<2-3 HARSH sentences - be blunt about what's wrong with this code, don't sugarcoat>",
  "suggestions": [
    "<brutal but actionable improvement 1 - be specific about what's bad>",
    "<brutal but actionable improvement 2 - be specific about what's bad>",
    "<brutal but actionable improvement 3 - be specific about what's bad>",
    "<brutal but actionable improvement 4 - be specific about what's bad>",
    "<brutal but actionable improvement 5 - be specific about what's bad>"
  ]
}

HARSH SCORING RULES (0-10 scale) - BE CRITICAL:
- 9-10: PERFECT code (almost never give this - code must be flawless)
- 7-8: Good code with solid practices (rare - only truly good code)
- 5-6: Average code that works but has issues (most code falls here)
- 3-4: Poor code with significant problems (be honest if code is bad)
- 0-2: Terrible code that should be rewritten (don't hesitate to give low scores)

RED FLAGS TO PENALIZE HEAVILY:
- No error handling: -2 points
- Poor variable naming (x, a, temp, data): -2 points
- No comments or documentation: -1 point
- Code duplication: -1 point
- Magic numbers without explanation: -1 point
- Security vulnerabilities: -3 points
- Inefficient algorithms: -2 points
- Not following language conventions: -1 point

BE BRUTALLY HONEST:
- If code is bad, say it's bad
- If variable names are terrible, call them out
- If there's no error handling, roast it
- If it's unreadable, say so
- Most code deserves 4-6/10, not 8-10/10

SUGGESTIONS MUST BE:
- SPECIFIC (mention exact variables, functions, lines)
- ACTIONABLE (tell them exactly what to fix)
- HARSH (don't say "consider", say "MUST fix" or "This is wrong")
- Include WHY it's bad (security risk, performance issue, etc.)
- Minimum 5 suggestions, be thorough
`;

  const response = await callAI(prompt);

  console.log("🤖 Raw AI Response:", response.substring(0, 500));

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in response");
      throw new Error("No JSON found in response");
    }

    console.log("📦 Extracted JSON:", jsonMatch[0].substring(0, 300));

    const evaluation = JSON.parse(jsonMatch[0]);

    // Validate and ensure all scores are numbers
    const validateScore = (score) => {
      const num = parseFloat(score);
      return isNaN(num) ? 5 : Math.max(0, Math.min(10, num));
    };

    evaluation.codeQuality = validateScore(evaluation.codeQuality);
    evaluation.readability = validateScore(evaluation.readability);
    evaluation.maintainability = validateScore(evaluation.maintainability);
    evaluation.performance = validateScore(evaluation.performance);
    evaluation.security = validateScore(evaluation.security);
    evaluation.bestPractices = validateScore(evaluation.bestPractices);

    // Ensure strings exist
    evaluation.detectedLanguage = evaluation.detectedLanguage || "Unknown";
    evaluation.summary = evaluation.summary || "This code needs significant improvement. Review the suggestions below.";

    // Ensure arrays exist with defaults
    evaluation.suggestions = Array.isArray(evaluation.suggestions) && evaluation.suggestions.length > 0
      ? evaluation.suggestions
      : ["Review code structure and organization", "Add error handling", "Follow language best practices"];

    // Calculate average score
    evaluation.average = (
      (evaluation.codeQuality +
        evaluation.readability +
        evaluation.maintainability +
        evaluation.performance +
        evaluation.security +
        evaluation.bestPractices) / 6
    ).toFixed(2);

    return evaluation;
  } catch (error) {
    console.error("❌ Failed to parse AI response:", error.message);
    console.error("Response was:", response.substring(0, 500));
    throw new Error("Invalid response format from AI");
  }
};

/**
 * Evaluate GitHub repository
 * @param {Object} repoData - { repoMetadata, readmeContent, sampleFiles }
 * @returns {Promise<Object>} - Repository evaluation scores
 */
export const evaluateRepository = async (repoData) => {
  const { repoMetadata, readmeContent, sampleFiles, fileStructure } = repoData;

  // Build file structure summary
  const structureSummary = fileStructure && fileStructure.length > 0
    ? fileStructure.map(f => `${f.type === 'dir' ? '📁' : '📄'} ${f.name}`).slice(0, 20).join(', ')
    : "No file structure available";

  const prompt = `
You are an EXPERT HACKATHON JUDGE evaluating a student project submission. Focus on CODE QUALITY and IMPLEMENTATION.

**IMPORTANT: For commit quality and contributor balance:**
- If this is a well-known project (1000+ commits), score normally (these matter for mature projects)
- If this is a new hackathon project (< 100 commits), be lenient (bulk commits are fine)
- Score based on what's appropriate for the project stage

**Repository Information:**
- Name: ${repoMetadata.name}
- Description: ${repoMetadata.description || "N/A"}
- Main Language: ${repoMetadata.mainLanguage || "Unknown"}
- Languages Used: ${repoMetadata.languages?.join(", ") || "Unknown"}
- Commit Count: ${repoMetadata.commitCount || 0}
- Contributors: ${repoMetadata.contributorCount || 0}

**File Structure (Root Level):**
${structureSummary}

**README Content:**
${readmeContent?.substring(0, 2000) || "No README available"}

**Sample Code Files:**
${sampleFiles || "No code files found"}

**🚨 CRITICAL VALIDATION CHECKS (Apply BEFORE scoring):**

1. **If "No code files found" or sampleFiles is empty:**
   - ALL scores MUST be 0-2/10 maximum
   - This is an EMPTY repository with no implementation
   - Summary must say "Empty repository - no code to evaluate"

2. **If README is < 50 characters:**
   - Documentation score CANNOT exceed 2/10
   - This is just a placeholder, not real documentation

3. **If file structure shows only 1 file (just README):**
   - Organization: 1/10 (nothing to organize)
   - Completeness: 0/10 (project doesn't exist)
   - All other scores: 0-2/10

4. **If Languages Used shows "Unknown":**
   - Tech Stack: 0/10 (no code to evaluate)
   - Project has no implementation

**MANDATORY SCORING RULES:**
- No code files → Maximum overall score: 15/100
- Only README file → Maximum overall score: 20/100
- README < 100 chars → Documentation score max 3/10
- Empty/template repos → All categories: 0-2/10

**EVALUATION CRITERIA:**

1. **Organization (0-10):** 
   - Proper folder structure? (src/, public/, config/, etc.)
   - Logical file separation?
   - Not everything dumped in root?
 
2. **Code Quality (0-10):**
   - Are variable names descriptive?
   - Is there error handling?
   - Is the code readable and clean?
   - Are there security vulnerabilities? (Penalize heavily)
   - **CRITICAL:** If code is vulnerable (e.g. hardcoded secrets, eval(), SQLi), score MUST be 0-3.

3. **Documentation (0-10):**
   - README explains what the project does?
   - Setup instructions provided?
   - Clear and helpful?

4. **Commit Quality (0-10):**
   - For mature projects (1000+ commits): Are commits well-organized and meaningful?
   - For new projects (< 100 commits): Don't penalize bulk commits - score 7-8 if code exists
   - Empty repos: 0-2

4. **Contributor Balance (0-10):**
   - For team projects: Is workload distributed?
   - For solo projects: Score 7-8 (one person is fine for hackathons)
   - Large projects (20+ contributors): Score 9-10
   - Don't penalize small teams

5. **Project Maturity (0-10):**
   - Looks like a working project vs skeleton?
   - Multiple files showing effort?
   - Key components present?
   - 1000+ commits = 9-10, 100+ commits = 7-8, < 20 commits = 4-6

6. **Tech Stack (0-10):**
   - Appropriate tools for the problem?
   - Modern/reasonable technology choices?
   - Not overengineered or underengineered?

7. **Professional Polish (0-10):**
   - Configuration files present (package.json, requirements.txt, etc.)?
   - Gitignore present?
   - License file?

**SCORING GUIDELINES BY PROJECT TYPE:**

**Mature/Popular Projects (1000+ commits, 20+ contributors):**
- CommitQuality: 8-10 (long history shows quality)
- ContributorBalance: 9-10 (large team)
- ProjectMaturity: 9-10 (very mature)
- Overall should score: 85-95/100

**Hackathon/Student Projects (< 100 commits, 1-5 contributors):**
- CommitQuality: 6-8 (bulk commits OK if code is good)
- ContributorBalance: 7-8 (solo/small team is normal)
- ProjectMaturity: Based on completeness (5-8)
- Overall should score: 60-80/100 if code is solid

**Empty/Template Repos (no code):**
- All scores: 0-2/10
- Overall should score: 5-15/100

Return ONLY this JSON (NO markdown, NO extra text):

{
  "organization": <score 0-10>,
  "codeQuality": <score 0-10>,
  "documentation": <score 0-10>,
  "commitQuality": <score 0-10>,
  "contributorBalance": <score 0-10>,
  "projectMaturity": <score 0-10>,
  "techStackSuitability": <score 0-10>,
  "summary": "Honest assessment of project quality focusing on implementation",
  "strengths": ["Specific strength with evidence", "Another strength", "Third strength"],
  "improvements": ["Actionable improvement", "Another improvement", "Third improvement"],
  "concerns": ["Any major concerns"],
  "bestPractices": ["Good practices being followed"]
}

Evaluate the PROJECT QUALITY, not popularity. A solo hackathon project with good code should score 70-80+.
`;

  console.log(`📊 Sending to AI for evaluation:`);
  console.log(`  - Commits: ${repoMetadata.commitCount || 0}`);
  console.log(`  - Contributors: ${repoMetadata.contributorCount || 0}`);
  console.log(`  - README length: ${readmeContent?.length || 0} chars`);
  console.log(`  - Files analyzed: ${fileStructure?.length || 0}`);
  console.log(`  - Sample code: ${sampleFiles ? 'YES' : 'NO'}`);

  const response = await callAI(prompt);

  console.log("🤖 Raw Repository AI Response (first 300 chars):", response.substring(0, 300));

  try {
    // Try to extract JSON from response - match the FIRST valid JSON object
    let jsonMatch = response.match(/\{[\s\S]*?\}(?=\s*$|\s*\n|\s*```)/);  // Match JSON before newline or code block end

    if (!jsonMatch) {
      // Try to find JSON in code blocks
      jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }

    if (!jsonMatch) {
      console.warn("⚠️ No JSON found in AI response, using defaults");
      console.warn("Full response:", response);
      // Return default values
      return {
        organization: 7,
        codeQuality: 7,
        documentation: 7,
        commitQuality: 7,
        contributorBalance: 7,
        projectMaturity: 7,
        techStackSuitability: 7,
        summary: "Repository analysis completed. The repository shows standard structure and organization.",
        improvements: ["Add more comprehensive documentation", "Improve commit message quality", "Consider adding CI/CD pipeline"],
        strengths: ["Repository is accessible and functional", "Basic structure is in place", "Project shows development activity"],
        concerns: ["Limited analysis data available"],
        bestPractices: ["Repository follows basic git practices"],
        average: "7.00"
      };
    }

    console.log("📦 Extracted JSON (first 200 chars):", jsonMatch[0].substring(0, 200));

    const evaluation = JSON.parse(jsonMatch[0]);

    // 🚨 BACKEND VALIDATION: Enforce empty repo detection
    const hasNoCode = !sampleFiles || sampleFiles.includes("No code files found") || sampleFiles.includes("No sample files");
    const smallReadme = !readmeContent || readmeContent.length < 100;
    const fewFiles = !fileStructure || fileStructure.length <= 1;

    // If repository is essentially empty, cap all scores
    if (hasNoCode && smallReadme && fewFiles) {
      console.warn("⚠️ Empty repository detected - applying score caps");
      evaluation.organization = Math.min(evaluation.organization, 2);
      evaluation.codeQuality = Math.min(evaluation.codeQuality, 2);
      evaluation.documentation = Math.min(evaluation.documentation, 2);
      evaluation.commitQuality = Math.min(evaluation.commitQuality, 2);
      evaluation.contributorBalance = Math.min(evaluation.contributorBalance, 2);
      evaluation.projectMaturity = Math.min(evaluation.projectMaturity, 1);
      evaluation.techStackSuitability = Math.min(evaluation.techStackSuitability, 1);
      evaluation.summary = "Empty repository with no code implementation - only placeholder files exist.";
    }

    // 🔧 FIX: Contributor Balance should NEVER be 0 for real projects
    // If the project has actual code (not empty), ensure contributor balance has a reasonable score
    if (!hasNoCode && evaluation.contributorBalance === 0) {
      const contributorCount = repoMetadata.contributorCount || 0;
      // Solo projects: 7/10, Small teams (2-5): 7/10, Larger teams: keep AI score
      if (contributorCount === 1 || contributorCount === 0) {
        evaluation.contributorBalance = 7; // Solo hackathon projects are normal
        console.log("✅ Fixed contributor balance for solo project: 0 → 7");
      } else if (contributorCount <= 5) {
        evaluation.contributorBalance = 7; // Small teams are fine
        console.log("✅ Fixed contributor balance for small team: 0 → 7");
      }
    }

    // 🔧 FIX: Commit Quality should reflect project completion, not commit count
    // If project has substantial code but low commit quality score, adjust it
    if (!hasNoCode && fileStructure && fileStructure.length > 20 && evaluation.commitQuality < 5) {
      evaluation.commitQuality = Math.max(evaluation.commitQuality, 6);
      console.log("✅ Adjusted commit quality for substantial project");
    }

    // Validate and ensure all scores are numbers
    const validateScore = (score) => {
      const num = parseFloat(score);
      return isNaN(num) ? 0 : Math.max(0, Math.min(10, num));
    };

    evaluation.organization = validateScore(evaluation.organization);
    evaluation.codeQuality = validateScore(evaluation.codeQuality);
    evaluation.documentation = validateScore(evaluation.documentation);
    evaluation.commitQuality = validateScore(evaluation.commitQuality);
    evaluation.contributorBalance = validateScore(evaluation.contributorBalance);
    evaluation.projectMaturity = validateScore(evaluation.projectMaturity);
    evaluation.techStackSuitability = validateScore(evaluation.techStackSuitability);

    // Ensure strings and arrays exist
    evaluation.summary = evaluation.summary || "Repository evaluation completed";
    evaluation.improvements = Array.isArray(evaluation.improvements) && evaluation.improvements.length > 0
      ? evaluation.improvements
      : ["Continue following best practices"];
    evaluation.strengths = Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0
      ? evaluation.strengths
      : ["Repository structure is acceptable"];
    evaluation.concerns = Array.isArray(evaluation.concerns)
      ? evaluation.concerns
      : [];
    evaluation.bestPractices = Array.isArray(evaluation.bestPractices)
      ? evaluation.bestPractices
      : [];

    // Calculate average score
    evaluation.average = (
      (evaluation.organization +
        evaluation.codeQuality +
        evaluation.documentation +
        evaluation.commitQuality +
        evaluation.contributorBalance +
        evaluation.projectMaturity +
        evaluation.techStackSuitability) / 7
    ).toFixed(2);

    return evaluation;
  } catch (error) {
    console.error("❌ Failed to parse AI response:", error.message);
    console.error("Response snippet:", response.substring(0, 300));
    // Return safe defaults instead of throwing
    return {
      organization: 7,
      codeQuality: 7,
      documentation: 7,
      commitQuality: 7,
      contributorBalance: 7,
      projectMaturity: 7,
      techStackSuitability: 7,
      summary: "AI parsing error - evaluation completed with default scores",
      improvements: ["Review repository structure and documentation"],
      strengths: ["Repository under evaluation"],
      concerns: ["Unable to complete detailed analysis"],
      bestPractices: [],
      average: "7.00"
    };
  }
};

/**
 * Generate final judge comments with anti-plagiarism variations
 * @param {Object} scores - { ideaScore, codeScore, repoScore, finalScore }
 * @param {string} randomSeed - Unique seed for variation
 * @returns {Promise<Object>} - Judge comments and suggestions
 */
export const generateJudgeComments = async (scores, randomSeed) => {
  const { ideaScore, codeScore, repoScore, finalScore } = scores;

  const prompt = `
You are a hackathon judge providing final feedback. Generate unique, personalized comments for this project.

**Scores:**
- Idea Score: ${ideaScore}/10
- Code Score: ${codeScore}/10
- Repository Score: ${repoScore}/10
- Final Combined Score: ${finalScore}/10

**Unique Context Seed:** ${randomSeed}

Provide feedback in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "judgeComments": "<2-3 paragraph personalized feedback in a conversational tone>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "suggestedNextSteps": ["<next step 1>", "<next step 2>", "<next step 3>"]
}

Make the comments unique and varied in style. Use the seed value to add variation. Be encouraging but honest.
`;

  const response = await callAI(prompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const result = JSON.parse(jsonMatch[0]);

    // Ensure all required fields exist
    result.judgeComments = result.judgeComments || "No comments provided";
    result.strengths = Array.isArray(result.strengths) ? result.strengths : [];
    result.weaknesses = Array.isArray(result.weaknesses) ? result.weaknesses : [];
    result.improvements = Array.isArray(result.improvements) ? result.improvements : [];
    result.suggestedNextSteps = Array.isArray(result.suggestedNextSteps) ? result.suggestedNextSteps : [];

    return result;
  } catch (error) {
    console.error("❌ Failed to parse AI response:", error.message);
    console.error("Response was:", response.substring(0, 500));
    throw new Error("Invalid response format from AI");
  }
};

/**
 * Compare Idea and Repository to check if they match
 * @param {Object} ideaData - { problemStatement, idea, features, techStack }
 * @param {Object} repoData - { languages, fileCount, structure, readmeContent, fileStructure, sampleFiles }
 * @returns {Promise<Object>} - Matching analysis with score, discrepancies, alignments
 */
export const compareIdeaAndRepo = async (ideaData, repoData) => {
  const { problemStatement, idea, features, techStack } = ideaData;
  const { languages, fileCount, structure, readmeContent, fileStructure, sampleFiles } = repoData;

  const prompt = `
You are an EXPERT CODE AUDITOR specializing in verifying if implementations match proposals.
You have 20+ years of experience detecting mismatches between specifications and actual code.

**SUBMITTED IDEA:**
Problem: ${problemStatement}
Proposed Solution: ${idea}
Claimed Features: ${JSON.stringify(features)}
Tech Stack: ${JSON.stringify(techStack)}

**ACTUAL REPOSITORY CODE:**
Languages Detected: ${JSON.stringify(languages)}
File Count: ${fileCount}
File Structure:
${fileStructure && fileStructure.length > 0 ? fileStructure.slice(0, 50).join('\n') : 'No file structure available'}

README Content:
${readmeContent ? readmeContent.substring(0, 3000) : "No README provided"}

Sample Code Files:
${sampleFiles ? sampleFiles.substring(0, 5000) : "No sample code available"}

**YOUR TASK:**
Compare what they PROPOSED (idea, features, tech stack) with what they ACTUALLY BUILT (analyze the code files above).

**ANALYSIS STEPS:**
1. Check if the code implements the proposed solution
2. Verify each claimed feature exists in the codebase
3. Confirm tech stack matches (check imports, dependencies, file extensions)
4. Detect if this is a completely different project

**MATCH CRITERIA:**
✅ ALIGNMENTS (what matches):
- Features that are clearly implemented in the code
- Tech stack items that are present (check imports, file types)
- Architecture that matches the proposal

❌ DISCREPANCIES (what's wrong):
- Missing features from the proposal
- Different tech stack (e.g., claimed React but code shows Vue)
- Completely unrelated code to the idea

**SCORING PHILOSOPHY:**
- 90-100: Perfect match, all features implemented with claimed tech stack
- 70-89: Good match, most features present, minor differences
- 50-69: Moderate match, some features missing or different tech stack
- 30-49: Poor match, major features missing or completely different implementation
- 0-29: No match, appears to be a different project entirely

**CRITICAL RULES:**
- If tech stack differs (e.g., claimed React but used Vue), PENALTY: -20 points
- If major features are missing, PENALTY: -15 points per missing feature (max -45)
- If repo looks unrelated to idea, SCORE: 0-20
- Be ruthlessly honest - analyze the ACTUAL CODE, not just the README

Return ONLY valid JSON (no markdown, no extra text):
{
  "matched": boolean,
  "matchScore": number (0-100),
  "matchSummary": "string",
  "discrepancies": ["Missing feature X", "Tech stack mismatch: claimed Y but code shows Z"],
  "alignments": ["Feature A implemented in file X", "Tech stack B correctly used"],
  "executiveSummary": "Honest verdict based on code analysis"
}
`;

  try {
    console.log("🔍 Comparing Idea and Repository...");
    const response = await callAI(prompt);
    console.log("🤖 Raw Comparison Response:", response);

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log("📊 Comparison Result:", result);

    // Validation
    if (typeof result.matchScore !== 'number' || result.matchScore < 0 || result.matchScore > 100) {
      throw new Error("Invalid matchScore");
    }

    return result;
  } catch (error) {
    console.error("❌ Error comparing idea and repo:", error.message);
    throw new Error(`Comparison failed: ${error.message}`);
  }
};

export default {
  callAI,
  callOllama,
  callGemini,
  evaluateIdea,
  evaluateCode,
  evaluateRepository,
  generateJudgeComments,
  compareIdeaAndRepo,
};
