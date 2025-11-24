import axios from "axios";

/**
 * Fetch repository data from GitHub API
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} - Repository metadata
 */
export const fetchRepoData = async (owner, repo) => {
  try {
    const headers = {};
    
    // Use GitHub token if available for higher rate limits
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch repository metadata
    const repoResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    const repoData = repoResponse.data;

    const metadata = {
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      mainLanguage: repoData.language,
      hasReadme: true, // We'll verify this separately
      lastUpdated: repoData.updated_at,
      createdAt: repoData.created_at,
      defaultBranch: repoData.default_branch,
    };

    return metadata;
  } catch (error) {
    if (error.response?.status === 403) {
      console.warn("⚠️ GitHub API rate limit exceeded. Using limited data.");
      // Return basic data even on rate limit
      return {
        name: repo,
        description: "Unable to fetch full details due to API rate limit",
        stars: 0,
        forks: 0,
        mainLanguage: "Unknown",
        hasReadme: true,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        defaultBranch: "main",
      };
    }
    console.error("❌ GitHub API Error (repo data):", error.message);
    throw new Error("Failed to fetch repository data from GitHub");
  }
};

/**
 * Fetch commit count for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<number>} - Total commit count
 */
export const fetchCommitCount = async (owner, repo) => {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch commits (GitHub API returns max 100 per page)
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      { headers }
    );

    // Extract total count from Link header if available
    const linkHeader = response.headers.link;
    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Fallback: return at least 1 if we got any commits
    return response.data.length > 0 ? 1 : 0;
  } catch (error) {
    console.error("❌ GitHub API Error (commits):", error.message);
    return 0;
  }
};

/**
 * Fetch contributors for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} - List of contributors
 */
export const fetchContributors = async (owner, repo) => {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      { headers }
    );

    return response.data.map((contributor) => ({
      username: contributor.login,
      commits: contributor.contributions,
      avatarUrl: contributor.avatar_url,
    }));
  } catch (error) {
    if (error.response?.status === 403) {
      console.warn("⚠️ GitHub API rate limit - contributors unavailable");
      return []; // Return empty array on rate limit
    }
    console.error("❌ GitHub API Error (contributors):", error.message);
    return [];
  }
};

/**
 * Fetch languages used in a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} - List of languages
 */
export const fetchLanguages = async (owner, repo) => {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers }
    );

    return Object.keys(response.data);
  } catch (error) {
    console.error("❌ GitHub API Error (languages):", error.message);
    return [];
  }
};

/**
 * Fetch README content
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<string>} - README content
 */
export const fetchReadme = async (owner, repo) => {
  try {
    const headers = { Accept: "application/vnd.github.v3.raw" };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("❌ GitHub API Error (README):", error.message);
    return null;
  }
};

/**
 * Fetch file structure (top-level files and directories)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} - File structure
 */
export const fetchFileStructure = async (owner, repo) => {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      { headers }
    );

    return response.data.map((item) => ({
      name: item.name,
      type: item.type,
      path: item.path,
      size: item.size,
    }));
  } catch (error) {
    if (error.response?.status === 403) {
      console.warn("⚠️ GitHub API rate limit - file structure unavailable");
      return [];
    }
    console.error("❌ GitHub API Error (file structure):", error.message);
    return [];
  }
};

/**
 * Fetch sample code files for analysis
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} maxFiles - Maximum number of files to fetch
 * @returns {Promise<string>} - Sample files content
 */
export const fetchSampleFiles = async (owner, repo, maxFiles = 3) => {
  try {
    const fileStructure = await fetchFileStructure(owner, repo);
    
    // Filter for common code files
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.go'];
    const codeFiles = fileStructure.filter(
      (file) => file.type === 'file' && codeExtensions.some(ext => file.name.endsWith(ext))
    ).slice(0, maxFiles);

    if (codeFiles.length === 0) {
      return "No sample code files found.";
    }

    const headers = { Accept: "application/vnd.github.v3.raw" };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const sampleContents = [];
    
    for (const file of codeFiles) {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
          { headers }
        );
        
        sampleContents.push(`\n// File: ${file.name}\n${response.data.substring(0, 500)}...\n`);
      } catch (err) {
        console.error(`Failed to fetch ${file.name}:`, err.message);
      }
    }

    return sampleContents.join("\n");
  } catch (error) {
    console.error("❌ GitHub API Error (sample files):", error.message);
    return "Unable to fetch sample files.";
  }
};

/**
 * Fetch complete repository analysis
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} - Complete repository data
 */
export const fetchCompleteRepoAnalysis = async (owner, repo) => {
  try {
    console.log(`📊 Analyzing GitHub repository: ${owner}/${repo}`);

    // Fetch all data in parallel
    const [metadata, commitCount, contributors, languages, readme, fileStructure] = 
      await Promise.all([
        fetchRepoData(owner, repo),
        fetchCommitCount(owner, repo),
        fetchContributors(owner, repo),
        fetchLanguages(owner, repo),
        fetchReadme(owner, repo),
        fetchFileStructure(owner, repo),
      ]);

    const sampleFiles = await fetchSampleFiles(owner, repo);

    return {
      repoMetadata: {
        ...metadata,
        commitCount,
        contributorCount: contributors.length,
        languages,
        hasReadme: !!readme,
      },
      contributors,
      readmeContent: readme || "No README available",
      fileStructure,
      sampleFiles,
    };
  } catch (error) {
    console.error("❌ Failed to complete repository analysis:", error.message);
    throw error;
  }
};

export default {
  fetchRepoData,
  fetchCommitCount,
  fetchContributors,
  fetchLanguages,
  fetchReadme,
  fetchFileStructure,
  fetchSampleFiles,
  fetchCompleteRepoAnalysis,
};
