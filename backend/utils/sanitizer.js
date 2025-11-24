/**
 * Sanitize code by removing sensitive information before sending to AI
 * @param {string} code - The code to sanitize
 * @returns {string} - Sanitized code
 */
export const sanitizeCode = (code) => {
  if (!code || typeof code !== "string") {
    return "";
  }

  let sanitized = code;

  // Remove common API keys and tokens patterns
  const patterns = [
    // API Keys
    /['"]?api[_-]?key['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /['"]?apikey['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    
    // Access Tokens
    /['"]?access[_-]?token['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /['"]?auth[_-]?token['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    
    // Secret Keys
    /['"]?secret[_-]?key['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /['"]?client[_-]?secret['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    
    // Database credentials
    /['"]?db[_-]?password['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /['"]?database[_-]?url['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /mongodb\+srv:\/\/[^'"]+/gi,
    /mysql:\/\/[^'"]+/gi,
    /postgres:\/\/[^'"]+/gi,
    
    // AWS credentials
    /AWS_ACCESS_KEY_ID\s*[:=]\s*['"][^'"]+['"]/gi,
    /AWS_SECRET_ACCESS_KEY\s*[:=]\s*['"][^'"]+['"]/gi,
    
    // Private keys
    /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
    
    // JWT tokens
    /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    
    // Generic environment variables with sensitive data
    /process\.env\.[A-Z_]+\s*=\s*['"][^'"]+['"]/gi,
  ];

  patterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, (match) => {
      // Extract the key name and replace the value
      if (match.includes("=") || match.includes(":")) {
        const parts = match.split(/[:=]/);
        return `${parts[0]}= "[REDACTED]"`;
      }
      return "[REDACTED]";
    });
  });

  // Remove email addresses
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[REDACTED_EMAIL]"
  );

  // Remove potential phone numbers
  sanitized = sanitized.replace(
    /\+?[1-9]\d{1,14}/g,
    (match) => {
      // Only redact if it looks like a phone number (10+ digits)
      return match.length >= 10 ? "[REDACTED_PHONE]" : match;
    }
  );

  return sanitized;
};

/**
 * Validate input data
 * @param {string} input - Input to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} - Whether input is valid
 */
export const validateInput = (input, maxLength = 50000) => {
  if (!input || typeof input !== "string") {
    return false;
  }

  if (input.length > maxLength) {
    return false;
  }

  // Check for malicious patterns (basic XSS/injection prevention)
  const maliciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  return true;
};

/**
 * Sanitize user input for idea evaluation
 * @param {Object} ideaData - Idea data object
 * @returns {Object} - Sanitized idea data
 */
export const sanitizeIdeaInput = (ideaData) => {
  const sanitized = {
    problemStatement: sanitizeText(ideaData.problemStatement),
    idea: sanitizeText(ideaData.idea),
    features: Array.isArray(ideaData.features)
      ? ideaData.features.map(sanitizeText).filter(Boolean)
      : [],
    techStack: Array.isArray(ideaData.techStack)
      ? ideaData.techStack.map(sanitizeText).filter(Boolean)
      : [],
  };

  return sanitized;
};

/**
 * Sanitize text input
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Remove potential HTML tags
  let sanitized = text.replace(/<[^>]*>/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Validate GitHub repository URL
 * @param {string} url - Repository URL
 * @returns {boolean} - Whether URL is valid
 */
export const validateGitHubUrl = (url) => {
  if (!url || typeof url !== "string") {
    return false;
  }

  const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/i;
  return githubPattern.test(url);
};

/**
 * Extract owner and repo name from GitHub URL
 * @param {string} url - GitHub repository URL
 * @returns {Object|null} - { owner, repo } or null if invalid
 */
export const parseGitHubUrl = (url) => {
  if (!validateGitHubUrl(url)) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/").filter(Boolean);
    
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        repo: parts[1].replace(/\.git$/, ""), // Remove .git suffix if present
      };
    }
  } catch (error) {
    return null;
  }

  return null;
};

export default {
  sanitizeCode,
  validateInput,
  sanitizeIdeaInput,
  sanitizeText,
  validateGitHubUrl,
  parseGitHubUrl,
};
