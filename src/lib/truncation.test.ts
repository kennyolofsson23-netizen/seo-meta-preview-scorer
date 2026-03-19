import { describe, it, expect } from "vitest";
import {
  truncateAtChars,
  truncateGoogleDesktopTitle,
  truncateGoogleDesktopDescription,
  truncateGoogleMobileTitle,
  truncateGoogleMobileDescription,
  truncateBingTitle,
  truncateBingDescription,
  highlightKeyword,
  formatGoogleBreadcrumb,
} from "./truncation";

describe("truncation", () => {
  describe("truncateAtChars", () => {
    it("returns string unchanged when within limit", () => {
      expect(truncateAtChars("Hello world", 20)).toBe("Hello world");
    });

    it("truncates with ellipsis at word boundary", () => {
      const text = "The quick brown fox jumps over the lazy dog in the park";
      const result = truncateAtChars(text, 30);
      expect(result).toContain("…");
      expect(result.replace("…", "").length).toBeLessThanOrEqual(30);
    });

    it("truncates at exact char count when no word boundary nearby", () => {
      const text = "A".repeat(40);
      const result = truncateAtChars(text, 20);
      expect(result).toBe("A".repeat(20) + "…");
    });

    it("returns string unchanged at exact limit", () => {
      const text = "A".repeat(60);
      expect(truncateAtChars(text, 60)).toBe(text);
    });
  });

  describe("truncateGoogleDesktopTitle", () => {
    it("truncates at 60 chars", () => {
      const title = "A".repeat(70);
      const result = truncateGoogleDesktopTitle(title);
      expect(result).toContain("…");
    });

    it("does not truncate title under 60 chars", () => {
      const title = "Short title";
      expect(truncateGoogleDesktopTitle(title)).toBe(title);
    });
  });

  describe("truncateGoogleDesktopDescription", () => {
    it("truncates at 160 chars", () => {
      const desc = "A".repeat(200);
      const result = truncateGoogleDesktopDescription(desc);
      expect(result).toContain("…");
    });

    it("does not truncate description under 160 chars", () => {
      const desc = "A".repeat(150);
      expect(truncateGoogleDesktopDescription(desc)).toBe(desc);
    });
  });

  describe("truncateGoogleMobileTitle", () => {
    it("truncates at 50 chars", () => {
      const title = "A".repeat(60);
      const result = truncateGoogleMobileTitle(title);
      expect(result).toContain("…");
    });

    it("does not truncate title under 50 chars", () => {
      const title = "A".repeat(40);
      expect(truncateGoogleMobileTitle(title)).toBe(title);
    });
  });

  describe("truncateGoogleMobileDescription", () => {
    it("truncates at 120 chars", () => {
      const desc = "A".repeat(150);
      const result = truncateGoogleMobileDescription(desc);
      expect(result).toContain("…");
    });
  });

  describe("truncateBingTitle", () => {
    it("truncates at 65 chars", () => {
      const title = "A".repeat(80);
      const result = truncateBingTitle(title);
      expect(result).toContain("…");
    });

    it("does not truncate title under 65 chars", () => {
      const title = "A".repeat(60);
      expect(truncateBingTitle(title)).toBe(title);
    });
  });

  describe("highlightKeyword", () => {
    it("returns single segment when no keyword", () => {
      const result = highlightKeyword("Hello world", "");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ text: "Hello world", isKeyword: false });
    });

    it("highlights keyword in text", () => {
      const result = highlightKeyword("Hello SEO world", "SEO");
      const keywords = result.filter((s) => s.isKeyword);
      expect(keywords).toHaveLength(1);
      expect(keywords[0].text).toBe("SEO");
    });

    it("is case-insensitive", () => {
      const result = highlightKeyword("Hello seo world", "SEO");
      const keywords = result.filter((s) => s.isKeyword);
      expect(keywords).toHaveLength(1);
    });

    it("handles keyword not in text", () => {
      const result = highlightKeyword("Hello world", "blockchain");
      expect(result).toHaveLength(1);
      expect(result[0].isKeyword).toBe(false);
    });

    it("handles multiple occurrences", () => {
      const result = highlightKeyword("SEO tips for SEO experts", "SEO");
      const keywords = result.filter((s) => s.isKeyword);
      expect(keywords).toHaveLength(2);
    });
  });

  describe("formatGoogleBreadcrumb", () => {
    it("extracts domain and breadcrumb from URL", () => {
      const result = formatGoogleBreadcrumb("https://example.com/blog/article");
      expect(result.domain).toBe("example.com");
      expect(result.breadcrumb).toBe("blog › article");
    });

    it("removes www from domain", () => {
      const result = formatGoogleBreadcrumb("https://www.example.com/page");
      expect(result.domain).toBe("example.com");
    });

    it("returns example.com for empty URL", () => {
      const result = formatGoogleBreadcrumb("");
      expect(result.domain).toBe("example.com");
      expect(result.breadcrumb).toBe("");
    });

    it("handles root URL with no path", () => {
      const result = formatGoogleBreadcrumb("https://example.com");
      expect(result.domain).toBe("example.com");
      expect(result.breadcrumb).toBe("");
    });

    it("handles deep nested path", () => {
      const result = formatGoogleBreadcrumb("https://example.com/a/b/c/page");
      expect(result.breadcrumb).toBe("a › b › c › page");
    });

    it("returns example.com for an invalid URL", () => {
      const result = formatGoogleBreadcrumb("not-a-valid-url");
      expect(result.domain).toBe("example.com");
      expect(result.breadcrumb).toBe("");
    });
  });

  // ─── truncateBingDescription ─────────────────────────────────────────────────

  describe("truncateBingDescription", () => {
    it("truncates descriptions longer than 160 chars", () => {
      const desc = "A".repeat(200);
      const result = truncateBingDescription(desc);
      expect(result).toContain("…");
    });

    it("does not truncate descriptions at or under 160 chars", () => {
      const desc = "A".repeat(160);
      expect(truncateBingDescription(desc)).toBe(desc);
    });

    it("shares the same 160-char limit as Google desktop description", () => {
      const desc = "A".repeat(161);
      const bingResult = truncateBingDescription(desc);
      const googleResult = truncateGoogleDesktopDescription(desc);
      // Both should truncate at 160
      expect(bingResult).toContain("…");
      expect(googleResult).toContain("…");
    });
  });

  // ─── truncateAtChars edge cases ───────────────────────────────────────────────

  describe("truncateAtChars edge cases", () => {
    it("returns the string unchanged when length equals maxChars exactly", () => {
      const text = "A".repeat(30);
      expect(truncateAtChars(text, 30)).toBe(text);
    });

    it("adds ellipsis when string is exactly 1 over the limit", () => {
      const text = "A".repeat(21);
      const result = truncateAtChars(text, 20);
      expect(result).toContain("…");
    });

    it("breaks at word boundary when a space is within 10 chars of the limit", () => {
      // "Hello world today" — limit 12, last space before pos 12 is at pos 5 ("Hello ")
      // 5 > 12 - 10 = 2 → word-boundary triggered
      const text = "Hello world today and more";
      const result = truncateAtChars(text, 12);
      expect(result).toMatch(/Hello world…|Hello…/);
      expect(result).toContain("…");
    });

    it("hard-cuts at maxChars when no word boundary is close enough", () => {
      // AAAA...AAAA — no spaces, so hard cut at exactly maxChars
      const text = "A".repeat(30);
      const result = truncateAtChars(text, 20);
      expect(result).toBe("A".repeat(20) + "…");
    });

    it("handles empty string without error", () => {
      expect(truncateAtChars("", 10)).toBe("");
    });
  });

  // ─── highlightKeyword edge cases ──────────────────────────────────────────────

  describe("highlightKeyword edge cases", () => {
    it("handles an empty text string", () => {
      const result = highlightKeyword("", "SEO");
      // Empty string splits into no parts (after filter), so result may be empty
      expect(Array.isArray(result)).toBe(true);
    });

    it("handles a keyword containing regex special characters", () => {
      // '(' is a regex special character — should not throw
      const result = highlightKeyword("(test) content here", "(test)");
      expect(Array.isArray(result)).toBe(true);
      const keywordSegments = result.filter((s) => s.isKeyword);
      expect(keywordSegments.length).toBeGreaterThanOrEqual(1);
    });

    it("handles a keyword with a dot (regex special char)", () => {
      const result = highlightKeyword("v1.0 release notes", "v1.0");
      const keywordSegments = result.filter((s) => s.isKeyword);
      expect(keywordSegments.length).toBeGreaterThanOrEqual(1);
    });

    it("returns non-keyword segment when keyword is whitespace only", () => {
      const result = highlightKeyword("Hello world", "   ");
      expect(result).toHaveLength(1);
      expect(result[0].isKeyword).toBe(false);
    });
  });

  // ─── truncateGoogleMobileDescription ─────────────────────────────────────────

  describe("truncateGoogleMobileDescription", () => {
    it("does not truncate descriptions under 120 chars", () => {
      const desc = "A".repeat(100);
      expect(truncateGoogleMobileDescription(desc)).toBe(desc);
    });

    it("does not truncate at exactly 120 chars", () => {
      const desc = "A".repeat(120);
      expect(truncateGoogleMobileDescription(desc)).toBe(desc);
    });

    it("truncates descriptions over 120 chars", () => {
      const desc = "A".repeat(130);
      expect(truncateGoogleMobileDescription(desc)).toContain("…");
    });
  });
});
