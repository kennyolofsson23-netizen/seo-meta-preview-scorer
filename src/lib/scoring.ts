/**
 * SEO Scoring Algorithms
 * Pure character counting, scoring logic, and validation functions
 */

export interface ScoringResult {
  score: number;
  status: "good" | "warning" | "error";
  message: string;
}

export interface FullSeoScore {
  title: ScoringResult;
  description: ScoringResult;
  keyword: ScoringResult;
  overall: number;
}

/**
 * Score page title
 * Optimal length: 30-60 characters (60-70 is acceptable)
 */
export function scoreTitle(title: string): ScoringResult {
  const length = title.length;

  if (length === 0) {
    return {
      score: 0,
      status: "error",
      message: "Add a title — Google won't show your page without one.",
    };
  }

  if (length < 30) {
    return {
      score: 40,
      status: "error",
      message: `Only ${length} characters — too short for Google to display well. Aim for 30–60.`,
    };
  }

  if (length >= 30 && length <= 60) {
    return {
      score: 100,
      status: "good",
      message: `Good length at ${length} characters. Google's sweet spot is 30–60.`,
    };
  }

  if (length > 60 && length <= 70) {
    return {
      score: 80,
      status: "warning",
      message: `At ${length} chars, this may truncate on mobile search. Try trimming to under 60.`,
    };
  }

  // > 70 characters
  return {
    score: 50,
    status: "error",
    message: `Too long at ${length} chars — Google cuts titles off around 60. Shorten it.`,
  };
}

/**
 * Score meta description
 * Optimal length: 155-160 characters (desktop Google SERP shows ~155-160)
 * Mobile shows ~120 characters
 */
export function scoreDescription(description: string): ScoringResult {
  const length = description.length;

  if (length === 0) {
    return {
      score: 0,
      status: "error",
      message: "Add a meta description — it's what convinces searchers to click through.",
    };
  }

  if (length < 120) {
    return {
      score: 40,
      status: "error",
      message: `At ${length} chars, this is too short. Aim for 155–160 to fill Google's full snippet.`,
    };
  }

  if (length >= 120 && length <= 160) {
    return {
      score: 100,
      status: "good",
      message: `Optimal at ${length} characters — displays in full on desktop and mobile.`,
    };
  }

  if (length > 160 && length <= 200) {
    return {
      score: 80,
      status: "warning",
      message: `At ${length} chars, Google may truncate this on mobile. Try trimming to 155–160.`,
    };
  }

  // > 200 characters
  return {
    score: 50,
    status: "error",
    message: `Too long at ${length} chars — Google cuts descriptions at ~160. Visible text ends: "…${description.substring(155, 160)}…"`,
  };
}

/**
 * Check if primary keyword appears in title or description
 */
export function scoreKeywordPresence(
  title: string,
  description: string,
  keyword: string,
): ScoringResult {
  const normalizedKeyword = keyword.toLowerCase().trim();

  if (!normalizedKeyword) {
    return {
      score: 0,
      status: "error",
      message: "Enter your target keyword to check if it appears in the title and description.",
    };
  }

  const titleLower = title.toLowerCase();
  const descriptionLower = description.toLowerCase();

  const inTitle = titleLower.includes(normalizedKeyword);
  const inDescription = descriptionLower.includes(normalizedKeyword);

  // Check if any individual words of the keyword appear in description (for partial coverage)
  const keywordWords = normalizedKeyword.split(/\s+/).filter(Boolean);
  const anyWordInDescription = keywordWords.some((word) =>
    descriptionLower.includes(word),
  );

  if (inTitle && inDescription) {
    return {
      score: 100,
      status: "good",
      message: `"${keyword}" is in both your title and description — excellent keyword placement.`,
    };
  }

  // Full phrase in title + any keyword word in description → also full score
  if (inTitle && anyWordInDescription) {
    return {
      score: 100,
      status: "good",
      message: `"${keyword}" is in your title and related terms appear in your description. Good signal.`,
    };
  }

  if (inTitle) {
    return {
      score: 90,
      status: "good",
      message: `"${keyword}" is in your title but not the description. Adding it there would strengthen relevance.`,
    };
  }

  if (inDescription) {
    return {
      score: 70,
      status: "warning",
      message: `"${keyword}" is in your description but not the title. Adding it to the title would have more impact.`,
    };
  }

  return {
    score: 0,
    status: "error",
    message: `"${keyword}" doesn't appear in either the title or description. Add it to improve relevance.`,
  };
}

/**
 * Check for mobile truncation issues
 */
export function checkMobileTruncation(title: string, description: string) {
  const titleTruncated = title.length > 50;
  const descriptionTruncated = description.length > 120;

  return {
    titleTruncated,
    descriptionTruncated,
    totalIssues: (titleTruncated ? 1 : 0) + (descriptionTruncated ? 1 : 0),
  };
}

/**
 * Calculate overall SEO score (0-100)
 */
export function calculateOverallScore(
  titleScore: number,
  descriptionScore: number,
  keywordScore: number,
): number {
  // Weight: title 40%, description 40%, keyword 20%
  const weighted =
    titleScore * 0.4 + descriptionScore * 0.4 + keywordScore * 0.2;
  return Math.round(weighted);
}

/**
 * Get color for score badge (Tailwind class)
 */
export function getScoreColor(status: "good" | "warning" | "error"): string {
  switch (status) {
    case "good":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
}

/**
 * Format score as percentage
 */
export function formatScore(score: number): string {
  return `${Math.min(100, Math.max(0, Math.round(score)))}%`;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: true }; // URL is optional
  }

  try {
    const parsed = new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "That doesn't look like a valid URL. Make sure it starts with https://",
    };
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  if (!url.trim()) return "example.com";

  try {
    const parsed = new URL(url);
    return parsed.hostname || "example.com";
  } catch {
    return "example.com";
  }
}

/**
 * Extract slug from URL (last part of path)
 */
export function extractSlug(url: string): string {
  if (!url.trim()) return "";

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.split("/").filter(Boolean);
    return path[path.length - 1] || "";
  } catch {
    return "";
  }
}
