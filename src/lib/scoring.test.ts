import { describe, it, expect } from "vitest";
import {
  scoreTitle,
  scoreDescription,
  scoreKeywordPresence,
  calculateOverallScore,
  checkMobileTruncation,
  validateUrl,
  extractDomain,
  extractSlug,
  getScoreColor,
  formatScore,
} from "./scoring";

describe("Scoring Module", () => {
  describe("scoreTitle", () => {
    it("should score empty title as error", () => {
      const result = scoreTitle("");
      expect(result.status).toBe("error");
      expect(result.score).toBe(0);
    });

    it("should score optimal title as good", () => {
      const result = scoreTitle("This is a great title for SEO work");
      expect(result.status).toBe("good");
      expect(result.score).toBe(100);
    });

    it("should score too short title as error", () => {
      const result = scoreTitle("Short");
      expect(result.status).toBe("error");
      expect(result.score).toBe(40);
    });

    it("should score too long title as error", () => {
      const result = scoreTitle(
        "This is an extremely long title that exceeds the recommended length for search engine optimization",
      );
      expect(result.status).toBe("error");
      expect(result.score).toBe(50);
    });

    it("should score 60-70 char title as warning", () => {
      const title = "A".repeat(65); // 65 characters
      const result = scoreTitle(title);
      expect(result.status).toBe("warning");
      expect(result.score).toBe(80);
    });
  });

  describe("scoreDescription", () => {
    it("should score empty description as error", () => {
      const result = scoreDescription("");
      expect(result.status).toBe("error");
      expect(result.score).toBe(0);
    });

    it("should score optimal description as good", () => {
      const description = "A".repeat(155);
      const result = scoreDescription(description);
      expect(result.status).toBe("good");
      expect(result.score).toBe(100);
    });

    it("should score too short description as error", () => {
      const result = scoreDescription("Short desc");
      expect(result.status).toBe("error");
      expect(result.score).toBe(40);
    });

    it("should score too long description as error", () => {
      const description = "A".repeat(250);
      const result = scoreDescription(description);
      expect(result.status).toBe("error");
    });
  });

  describe("scoreKeywordPresence", () => {
    it("should score keyword in both title and description as good", () => {
      const result = scoreKeywordPresence(
        "Best SEO Tips for 2024",
        "Learn the best SEO tips and strategies for optimizing your website",
        "SEO tips",
      );
      expect(result.status).toBe("good");
      expect(result.score).toBe(100);
    });

    it("should score keyword only in title as good", () => {
      const result = scoreKeywordPresence(
        "Best SEO Tips for 2024",
        "Learn the best strategies for optimizing your website",
        "SEO tips",
      );
      expect(result.status).toBe("good");
      expect(result.score).toBe(90);
    });

    it("should score keyword only in description as warning", () => {
      const result = scoreKeywordPresence(
        "Best Tips for 2024",
        "Learn the best SEO tips and strategies for optimizing your website",
        "SEO tips",
      );
      expect(result.status).toBe("warning");
      expect(result.score).toBe(70);
    });

    it("should score missing keyword as error", () => {
      const result = scoreKeywordPresence(
        "Best Tips for 2024",
        "Learn the best strategies for optimizing your website",
        "blockchain",
      );
      expect(result.status).toBe("error");
      expect(result.score).toBe(0);
    });

    it("should be case insensitive", () => {
      const result = scoreKeywordPresence(
        "BEST SEO TIPS",
        "Learn SEO strategies",
        "seo tips",
      );
      expect(result.score).toBe(100);
    });
  });

  describe("calculateOverallScore", () => {
    it("should calculate weighted average correctly", () => {
      // title: 100 * 0.4 = 40
      // description: 80 * 0.4 = 32
      // keyword: 60 * 0.2 = 12
      // Total: 84
      const score = calculateOverallScore(100, 80, 60);
      expect(score).toBe(84);
    });

    it("should return 0 for all zeros", () => {
      const score = calculateOverallScore(0, 0, 0);
      expect(score).toBe(0);
    });

    it("should return 100 for all perfect scores", () => {
      const score = calculateOverallScore(100, 100, 100);
      expect(score).toBe(100);
    });
  });

  describe("validateUrl", () => {
    it("should accept valid URLs", () => {
      const result = validateUrl("https://example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept http URLs", () => {
      const result = validateUrl("http://example.com/page");
      expect(result.valid).toBe(true);
    });

    it("should accept empty URL as valid (optional)", () => {
      const result = validateUrl("");
      expect(result.valid).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const result = validateUrl("not a url");
      expect(result.valid).toBe(false);
    });
  });

  describe("extractDomain", () => {
    it("should extract domain from URL", () => {
      const domain = extractDomain("https://example.com/page");
      expect(domain).toBe("example.com");
    });

    it("should handle empty URL", () => {
      const domain = extractDomain("");
      expect(domain).toBe("example.com");
    });
  });

  describe("extractSlug", () => {
    it("should extract slug from URL", () => {
      const slug = extractSlug("https://example.com/blog/my-article");
      expect(slug).toBe("my-article");
    });

    it("should return empty slug for root URL", () => {
      const slug = extractSlug("https://example.com");
      expect(slug).toBe("");
    });

    it("should return empty slug for empty string", () => {
      expect(extractSlug("")).toBe("");
    });

    it("should extract the last segment from a deep path", () => {
      expect(extractSlug("https://example.com/a/b/c/page")).toBe("page");
    });
  });

  // ─── scoreTitle boundary cases ──────────────────────────────────────────────

  describe("scoreTitle boundary cases", () => {
    it("scores exactly 10 chars as error (below min good of 30)", () => {
      const result = scoreTitle("A".repeat(10));
      expect(result.status).toBe("error");
      expect(result.score).toBe(40);
    });

    it("scores exactly 60 chars as good (boundary: max good)", () => {
      const result = scoreTitle("A".repeat(60));
      expect(result.status).toBe("good");
      expect(result.score).toBe(100);
    });

    it("scores exactly 61 chars as warning (just over good range)", () => {
      const result = scoreTitle("A".repeat(61));
      expect(result.status).toBe("warning");
      expect(result.score).toBe(80);
    });

    it("scores exactly 70 chars as warning (boundary: max warning)", () => {
      const result = scoreTitle("A".repeat(70));
      expect(result.status).toBe("warning");
      expect(result.score).toBe(80);
    });

    it("scores exactly 71 chars as error (just over warning range)", () => {
      const result = scoreTitle("A".repeat(71));
      expect(result.status).toBe("error");
      expect(result.score).toBe(50);
    });

    it("scores 9 chars as error (just under minimum)", () => {
      const result = scoreTitle("A".repeat(9));
      expect(result.status).toBe("error");
      expect(result.score).toBe(40);
    });

    it("message includes character count for too-short titles", () => {
      const result = scoreTitle("Hi");
      expect(result.message).toContain("2");
    });

    it("message includes character count for too-long titles", () => {
      const result = scoreTitle("A".repeat(75));
      expect(result.message).toContain("75");
    });
  });

  // ─── scoreDescription boundary cases ────────────────────────────────────────

  describe("scoreDescription boundary cases", () => {
    it("scores exactly 120 chars as good (boundary: min good)", () => {
      const result = scoreDescription("A".repeat(120));
      expect(result.status).toBe("good");
      expect(result.score).toBe(100);
    });

    it("scores exactly 160 chars as good (boundary: max good)", () => {
      const result = scoreDescription("A".repeat(160));
      expect(result.status).toBe("good");
      expect(result.score).toBe(100);
    });

    it("scores exactly 161 chars as warning (just over good range)", () => {
      const result = scoreDescription("A".repeat(161));
      expect(result.status).toBe("warning");
      expect(result.score).toBe(80);
    });

    it("scores exactly 200 chars as warning (boundary: max warning)", () => {
      const result = scoreDescription("A".repeat(200));
      expect(result.status).toBe("warning");
      expect(result.score).toBe(80);
    });

    it("scores exactly 201 chars as error (just over warning range)", () => {
      const result = scoreDescription("A".repeat(201));
      expect(result.status).toBe("error");
      expect(result.score).toBe(50);
    });

    it("scores 119 chars as error (just under minimum good)", () => {
      const result = scoreDescription("A".repeat(119));
      expect(result.status).toBe("error");
      expect(result.score).toBe(40);
    });
  });

  // ─── checkMobileTruncation ───────────────────────────────────────────────────

  describe("checkMobileTruncation", () => {
    it("returns no truncation when both are within limits", () => {
      const result = checkMobileTruncation("A".repeat(50), "A".repeat(120));
      expect(result.titleTruncated).toBe(false);
      expect(result.descriptionTruncated).toBe(false);
      expect(result.totalIssues).toBe(0);
    });

    it("flags title as truncated when title > 50 chars", () => {
      const result = checkMobileTruncation("A".repeat(51), "A".repeat(100));
      expect(result.titleTruncated).toBe(true);
      expect(result.totalIssues).toBe(1);
    });

    it("flags description as truncated when description > 120 chars", () => {
      const result = checkMobileTruncation("A".repeat(30), "A".repeat(121));
      expect(result.descriptionTruncated).toBe(true);
      expect(result.totalIssues).toBe(1);
    });

    it("flags both when both exceed mobile limits", () => {
      const result = checkMobileTruncation("A".repeat(51), "A".repeat(121));
      expect(result.titleTruncated).toBe(true);
      expect(result.descriptionTruncated).toBe(true);
      expect(result.totalIssues).toBe(2);
    });

    it("does not flag title at exactly 50 chars", () => {
      const result = checkMobileTruncation("A".repeat(50), "A".repeat(100));
      expect(result.titleTruncated).toBe(false);
    });

    it("does not flag description at exactly 120 chars", () => {
      const result = checkMobileTruncation("A".repeat(30), "A".repeat(120));
      expect(result.descriptionTruncated).toBe(false);
    });
  });

  // ─── getScoreColor ───────────────────────────────────────────────────────────

  describe("getScoreColor", () => {
    it("returns a green class for 'good' status", () => {
      expect(getScoreColor("good")).toMatch(/green/);
    });

    it("returns a yellow class for 'warning' status", () => {
      expect(getScoreColor("warning")).toMatch(/yellow/);
    });

    it("returns a red class for 'error' status", () => {
      expect(getScoreColor("error")).toMatch(/red/);
    });

    it("returns a non-empty string for every status", () => {
      (["good", "warning", "error"] as const).forEach((status) => {
        expect(getScoreColor(status).length).toBeGreaterThan(0);
      });
    });
  });

  // ─── formatScore ─────────────────────────────────────────────────────────────

  describe("formatScore", () => {
    it("formats 100 as '100%'", () => {
      expect(formatScore(100)).toBe("100%");
    });

    it("formats 0 as '0%'", () => {
      expect(formatScore(0)).toBe("0%");
    });

    it("formats 75 as '75%'", () => {
      expect(formatScore(75)).toBe("75%");
    });

    it("rounds fractional scores to nearest integer", () => {
      expect(formatScore(75.6)).toBe("76%");
      expect(formatScore(75.4)).toBe("75%");
    });

    it("clamps scores above 100 to 100%", () => {
      expect(formatScore(150)).toBe("100%");
    });

    it("clamps negative scores to 0%", () => {
      expect(formatScore(-10)).toBe("0%");
    });
  });

  // ─── validateUrl edge cases ───────────────────────────────────────────────────

  describe("validateUrl edge cases", () => {
    it("treats a whitespace-only string as valid (URL is optional)", () => {
      expect(validateUrl("   ").valid).toBe(true);
    });

    it("rejects a URL without protocol (no http/https)", () => {
      expect(validateUrl("example.com/page").valid).toBe(false);
    });

    it("accepts a URL with query string", () => {
      expect(validateUrl("https://example.com/page?q=seo").valid).toBe(true);
    });

    it("accepts a URL with fragment", () => {
      expect(validateUrl("https://example.com/page#section").valid).toBe(true);
    });
  });

  // ─── extractDomain edge cases ─────────────────────────────────────────────────

  describe("extractDomain edge cases", () => {
    it("extracts subdomain correctly", () => {
      expect(extractDomain("https://blog.example.com/post")).toBe(
        "blog.example.com",
      );
    });

    it("returns example.com for an invalid URL", () => {
      expect(extractDomain("not-a-url")).toBe("example.com");
    });

    it("returns example.com for a whitespace-only string", () => {
      expect(extractDomain("   ")).toBe("example.com");
    });
  });

  // ─── scoreKeywordPresence edge cases ──────────────────────────────────────────

  describe("scoreKeywordPresence edge cases", () => {
    it("returns error with score 0 for empty keyword", () => {
      const result = scoreKeywordPresence(
        "Great title here",
        "A".repeat(150),
        "",
      );
      expect(result.status).toBe("error");
      expect(result.score).toBe(0);
    });

    it("returns 100 when keyword full-phrase is in both title and description", () => {
      const result = scoreKeywordPresence(
        "Best SEO tips for blogging",
        "Discover SEO tips that work for all skill levels.",
        "SEO tips",
      );
      expect(result.score).toBe(100);
    });

    it("returns 100 when keyword is in title and a word from keyword is in description", () => {
      // inTitle = true, anyWordInDescription = true ("SEO" appears in description)
      const result = scoreKeywordPresence(
        "Best SEO tips available",
        "Learn great SEO strategies and improve your site",
        "SEO tips",
      );
      expect(result.score).toBe(100);
      expect(result.status).toBe("good");
    });

    it("returns 70 when keyword phrase is only in description", () => {
      const result = scoreKeywordPresence(
        "Marketing strategies for growth",
        "Use SEO tips to improve your search ranking today",
        "SEO tips",
      );
      expect(result.score).toBe(70);
      expect(result.status).toBe("warning");
    });

    it("error message includes the keyword when not found", () => {
      const result = scoreKeywordPresence(
        "Marketing blog",
        "General content about marketing",
        "blockchain",
      );
      expect(result.message).toContain("blockchain");
    });
  });
});
