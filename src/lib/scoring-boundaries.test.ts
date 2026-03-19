/**
 * Additional boundary-value and edge-case tests for the scoring module.
 * Complements src/lib/scoring.test.ts without duplicating its tests.
 */
import { describe, it, expect } from "vitest";
import {
  scoreTitle,
  scoreDescription,
  scoreKeywordPresence,
  checkMobileTruncation,
  getScoreColor,
  formatScore,
  validateUrl,
  extractDomain,
  extractSlug,
} from "./scoring";

describe("Scoring – boundary values", () => {
  // ──────────────────────────────────────────────────────────────
  // scoreTitle
  // ──────────────────────────────────────────────────────────────
  describe("scoreTitle boundaries", () => {
    it("scores exactly 9 chars as error (score 40)", () => {
      const r = scoreTitle("A".repeat(9));
      expect(r.status).toBe("error");
      expect(r.score).toBe(40);
    });

    it("scores exactly 10 chars as error (score 40)", () => {
      const r = scoreTitle("A".repeat(10));
      expect(r.status).toBe("error");
      expect(r.score).toBe(40);
    });

    it("scores exactly 60 chars as good (score 100)", () => {
      const r = scoreTitle("A".repeat(60));
      expect(r.status).toBe("good");
      expect(r.score).toBe(100);
    });

    it("scores exactly 61 chars as warning (score 80)", () => {
      const r = scoreTitle("A".repeat(61));
      expect(r.status).toBe("warning");
      expect(r.score).toBe(80);
    });

    it("scores exactly 70 chars as warning (score 80)", () => {
      const r = scoreTitle("A".repeat(70));
      expect(r.status).toBe("warning");
      expect(r.score).toBe(80);
    });

    it("scores exactly 71 chars as error (score 50)", () => {
      const r = scoreTitle("A".repeat(71));
      expect(r.status).toBe("error");
      expect(r.score).toBe(50);
    });

    it("includes current character count in the message", () => {
      const r = scoreTitle("A".repeat(9));
      expect(r.message).toContain("9");
    });

    it("mentions 30-60 target range in too-short message", () => {
      const r = scoreTitle("A".repeat(9));
      expect(r.message).toContain("30");
      expect(r.message).toContain("60");
    });
  });

  // ──────────────────────────────────────────────────────────────
  // scoreDescription
  // ──────────────────────────────────────────────────────────────
  describe("scoreDescription boundaries", () => {
    it("scores exactly 119 chars as error (score 40)", () => {
      const r = scoreDescription("A".repeat(119));
      expect(r.status).toBe("error");
      expect(r.score).toBe(40);
    });

    it("scores exactly 120 chars as good (score 100)", () => {
      const r = scoreDescription("A".repeat(120));
      expect(r.status).toBe("good");
      expect(r.score).toBe(100);
    });

    it("scores exactly 160 chars as good (score 100)", () => {
      const r = scoreDescription("A".repeat(160));
      expect(r.status).toBe("good");
      expect(r.score).toBe(100);
    });

    it("scores exactly 161 chars as warning (score 80)", () => {
      const r = scoreDescription("A".repeat(161));
      expect(r.status).toBe("warning");
      expect(r.score).toBe(80);
    });

    it("scores exactly 200 chars as warning (score 80)", () => {
      const r = scoreDescription("A".repeat(200));
      expect(r.status).toBe("warning");
      expect(r.score).toBe(80);
    });

    it("scores exactly 201 chars as error (score 50)", () => {
      const r = scoreDescription("A".repeat(201));
      expect(r.status).toBe("error");
      expect(r.score).toBe(50);
    });

    it("includes current character count in message for optimal range", () => {
      const r = scoreDescription("A".repeat(155));
      expect(r.message).toContain("155");
    });
  });

  // ──────────────────────────────────────────────────────────────
  // scoreKeywordPresence – edge cases
  // ──────────────────────────────────────────────────────────────
  describe("scoreKeywordPresence edge cases", () => {
    it("trims whitespace from keyword before matching", () => {
      const r = scoreKeywordPresence("Best SEO Guide", "SEO guide content", "  seo guide  ");
      expect(r.status).toBe("good");
    });

    it("handles multi-word keyword with partial word overlap in description", () => {
      // "SEO tips" → title has full phrase; description has "SEO" (partial) but not "tips"
      // anyWordInDescription should be true because "seo" is in description
      const r = scoreKeywordPresence(
        "Best SEO Tips",
        "Learn about SEO strategies",
        "SEO tips",
      );
      // inTitle = true (has "seo tips" ✗ — wait, title "Best SEO Tips" lowercase = "best seo tips", keyword lowercase = "seo tips"  → includes "seo tips" ✓)
      // inDescription = false ("learn about seo strategies" doesn't include "seo tips")
      // anyWordInDescription = true (description contains "seo")
      // So inTitle && anyWordInDescription → score 100
      expect(r.score).toBe(100);
      expect(r.status).toBe("good");
    });

    it("scores keyword only in description as warning (score 70)", () => {
      const r = scoreKeywordPresence(
        "My Blog Post Title",
        "Learn about SEO tips here",
        "seo tips",
      );
      expect(r.status).toBe("warning");
      expect(r.score).toBe(70);
    });

    it("includes keyword name in not-found error message", () => {
      const r = scoreKeywordPresence("Hello World", "Nothing here", "blockchain");
      expect(r.message).toContain("blockchain");
      expect(r.status).toBe("error");
    });

    it("handles special regex characters in keyword gracefully", () => {
      const r = scoreKeywordPresence(
        "Price: $100 (offer)",
        "Get the $100 (offer) now",
        "$100 (offer)",
      );
      expect(r.score).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // checkMobileTruncation
  // ──────────────────────────────────────────────────────────────
  describe("checkMobileTruncation", () => {
    it("returns no truncation for content within limits", () => {
      const r = checkMobileTruncation("Short title", "Short description");
      expect(r.titleTruncated).toBe(false);
      expect(r.descriptionTruncated).toBe(false);
      expect(r.totalIssues).toBe(0);
    });

    it("flags title when > 50 chars", () => {
      const r = checkMobileTruncation("A".repeat(51), "Short desc");
      expect(r.titleTruncated).toBe(true);
      expect(r.totalIssues).toBe(1);
    });

    it("does NOT flag title at exactly 50 chars", () => {
      const r = checkMobileTruncation("A".repeat(50), "Short desc");
      expect(r.titleTruncated).toBe(false);
    });

    it("flags description when > 120 chars", () => {
      const r = checkMobileTruncation("Short title", "A".repeat(121));
      expect(r.descriptionTruncated).toBe(true);
      expect(r.totalIssues).toBe(1);
    });

    it("does NOT flag description at exactly 120 chars", () => {
      const r = checkMobileTruncation("Short title", "A".repeat(120));
      expect(r.descriptionTruncated).toBe(false);
    });

    it("counts both issues when both exceed limits", () => {
      const r = checkMobileTruncation("A".repeat(51), "A".repeat(121));
      expect(r.titleTruncated).toBe(true);
      expect(r.descriptionTruncated).toBe(true);
      expect(r.totalIssues).toBe(2);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // getScoreColor
  // ──────────────────────────────────────────────────────────────
  describe("getScoreColor", () => {
    it("returns a green class for good status", () => {
      expect(getScoreColor("good")).toContain("green");
    });

    it("returns a yellow class for warning status", () => {
      expect(getScoreColor("warning")).toContain("yellow");
    });

    it("returns a red class for error status", () => {
      expect(getScoreColor("error")).toContain("red");
    });

    it("returns a non-empty string for each status", () => {
      (["good", "warning", "error"] as const).forEach((status) => {
        expect(getScoreColor(status).length).toBeGreaterThan(0);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────
  // formatScore
  // ──────────────────────────────────────────────────────────────
  describe("formatScore", () => {
    it("formats 100 as '100%'", () => {
      expect(formatScore(100)).toBe("100%");
    });

    it("formats 0 as '0%'", () => {
      expect(formatScore(0)).toBe("0%");
    });

    it("clamps values above 100 to 100%", () => {
      expect(formatScore(150)).toBe("100%");
    });

    it("clamps negative values to 0%", () => {
      expect(formatScore(-5)).toBe("0%");
    });

    it("rounds fractional scores", () => {
      expect(formatScore(84.6)).toBe("85%");
      expect(formatScore(84.4)).toBe("84%");
    });

    it("formats typical SEO scores correctly", () => {
      expect(formatScore(80)).toBe("80%");
      expect(formatScore(60)).toBe("60%");
    });
  });

  // ──────────────────────────────────────────────────────────────
  // validateUrl – additional cases
  // ──────────────────────────────────────────────────────────────
  describe("validateUrl – additional cases", () => {
    it("accepts URL with query parameters", () => {
      expect(validateUrl("https://example.com?q=seo&lang=en").valid).toBe(true);
    });

    it("accepts URL with hash fragment", () => {
      expect(validateUrl("https://example.com/page#section").valid).toBe(true);
    });

    it("rejects URL with no protocol", () => {
      expect(validateUrl("example.com/page").valid).toBe(false);
    });

    it("rejects plain text as URL", () => {
      const r = validateUrl("not a url at all");
      expect(r.valid).toBe(false);
      expect(r.error).toBeDefined();
    });

    it("returns error message containing 'http' hint", () => {
      const r = validateUrl("badurl");
      expect(r.error).toContain("http");
    });

    it("accepts http URL (not just https)", () => {
      expect(validateUrl("http://example.com").valid).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // extractDomain – additional cases
  // ──────────────────────────────────────────────────────────────
  describe("extractDomain – additional cases", () => {
    it("keeps subdomain in result", () => {
      expect(extractDomain("https://blog.example.com/article")).toBe(
        "blog.example.com",
      );
    });

    it("handles localhost URL", () => {
      expect(extractDomain("http://localhost:3000/page")).toBe("localhost");
    });

    it("returns example.com for invalid URL", () => {
      expect(extractDomain("not-a-valid-url")).toBe("example.com");
    });

    it("extracts domain from URL with deep path", () => {
      expect(extractDomain("https://example.com/a/b/c/d")).toBe("example.com");
    });
  });

  // ──────────────────────────────────────────────────────────────
  // extractSlug – additional cases
  // ──────────────────────────────────────────────────────────────
  describe("extractSlug – additional cases", () => {
    it("extracts slug from single-segment path", () => {
      expect(extractSlug("https://example.com/blog")).toBe("blog");
    });

    it("extracts last segment from nested path", () => {
      expect(extractSlug("https://example.com/a/b/slug")).toBe("slug");
    });

    it("returns empty string for empty input", () => {
      expect(extractSlug("")).toBe("");
    });

    it("returns empty string for invalid URL", () => {
      expect(extractSlug("not-a-url")).toBe("");
    });

    it("returns empty string for root URL with no path", () => {
      expect(extractSlug("https://example.com/")).toBe("");
    });
  });
});
