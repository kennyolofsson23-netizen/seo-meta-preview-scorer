/**
 * Pixel-accurate truncation logic for SERP previews
 * Google truncates by pixel width (~600px), not raw character count.
 * We approximate using character count with known safe limits.
 */

/**
 * Truncate a string to a maximum character length, appending ellipsis.
 * Tries to break at a word boundary within 10 chars of the limit.
 */
export function truncateAtChars(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  // Try to break at word boundary
  const hardCut = text.substring(0, maxChars);
  const lastSpace = hardCut.lastIndexOf(" ");

  // If word boundary is within 10 chars of limit, use it
  if (lastSpace > maxChars - 10) {
    return text.substring(0, lastSpace) + "…";
  }

  return hardCut + "…";
}

/**
 * Truncate title for Google Desktop SERP (~60 chars)
 */
export function truncateGoogleDesktopTitle(title: string): string {
  return truncateAtChars(title, 60);
}

/**
 * Truncate description for Google Desktop SERP (~160 chars)
 */
export function truncateGoogleDesktopDescription(description: string): string {
  return truncateAtChars(description, 160);
}

/**
 * Truncate title for Google Mobile SERP (~50 chars)
 */
export function truncateGoogleMobileTitle(title: string): string {
  return truncateAtChars(title, 50);
}

/**
 * Truncate description for Google Mobile SERP (~120 chars)
 */
export function truncateGoogleMobileDescription(description: string): string {
  return truncateAtChars(description, 120);
}

/**
 * Truncate title for Bing SERP (~65 chars)
 */
export function truncateBingTitle(title: string): string {
  return truncateAtChars(title, 65);
}

/**
 * Truncate description for Bing SERP (~160 chars)
 */
export function truncateBingDescription(description: string): string {
  return truncateAtChars(description, 160);
}

/**
 * Highlight keyword occurrences by splitting text around keyword matches.
 * Returns an array of segments: { text, isKeyword }
 */
export interface TextSegment {
  text: string;
  isKeyword: boolean;
}

export function highlightKeyword(text: string, keyword: string): TextSegment[] {
  if (!keyword.trim()) {
    return [{ text, isKeyword: false }];
  }

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isKeyword: part.toLowerCase() === keyword.toLowerCase(),
    }));
}

/**
 * Format URL for display in Google breadcrumb format.
 * e.g. "https://example.com/blog/article" → "example.com › blog › article"
 */
export function formatGoogleBreadcrumb(url: string): {
  domain: string;
  breadcrumb: string;
} {
  if (!url) {
    return { domain: "example.com", breadcrumb: "" };
  }

  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const breadcrumb = pathParts.length > 0 ? pathParts.join(" › ") : "";
    return { domain, breadcrumb };
  } catch {
    return { domain: "example.com", breadcrumb: "" };
  }
}
