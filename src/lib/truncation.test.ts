import { describe, it, expect } from "vitest";
import {
  truncateAtChars,
  truncateGoogleDesktopTitle,
  truncateGoogleDesktopDescription,
  truncateGoogleMobileTitle,
  truncateGoogleMobileDescription,
  truncateBingTitle,
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
  });
});
