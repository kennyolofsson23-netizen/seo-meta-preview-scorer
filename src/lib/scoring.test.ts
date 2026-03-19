import { describe, it, expect } from "vitest";
import {
  scoreTitle,
  scoreDescription,
  scoreKeywordPresence,
  calculateOverallScore,
  validateUrl,
  extractDomain,
  extractSlug,
} from "./scoring";

describe("Scoring Module", () => {
  describe("scoreTitle", () => {
    it("should score empty title as error", () => {
      const result = scoreTitle("");
      expect(result.status).toBe("error");
      expect(result.score).toBe(0);
    });

    it("should score optimal title as good", () => {
      const result = scoreTitle("This is a great title");
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

    it("should score too short description as warning", () => {
      const result = scoreDescription("Short desc");
      expect(result.status).toBe("warning");
      expect(result.score).toBe(60);
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
  });
});
