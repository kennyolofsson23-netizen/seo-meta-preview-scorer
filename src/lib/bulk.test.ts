import { describe, it, expect } from "vitest";
import {
  parseCsv,
  scoreBulkRow,
  processBulkRows,
  exportResultsToCsv,
} from "./bulk";

describe("bulk", () => {
  describe("parseCsv", () => {
    it("parses basic CSV with headers", () => {
      const csv = `title,description,url
My Page Title,My meta description,https://example.com`;
      const result = parseCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("My Page Title");
      expect(result[0].description).toBe("My meta description");
      expect(result[0].url).toBe("https://example.com");
    });

    it("handles multiple rows", () => {
      const csv = `title,description,url
Title 1,Desc 1,https://example.com/1
Title 2,Desc 2,https://example.com/2`;
      const result = parseCsv(csv);
      expect(result).toHaveLength(2);
    });

    it("returns empty array if no title column", () => {
      const csv = `name,content
My Name,My content`;
      expect(parseCsv(csv)).toHaveLength(0);
    });

    it("handles quoted fields with commas", () => {
      const csv = `title,description,url
"Title, with comma","Description here",https://example.com`;
      const result = parseCsv(csv);
      expect(result[0].title).toBe("Title, with comma");
    });

    it("returns empty for empty CSV", () => {
      expect(parseCsv("")).toHaveLength(0);
    });

    it("ignores empty lines", () => {
      const csv = `title,description,url
Title 1,Desc 1,https://example.com/1

Title 2,Desc 2,https://example.com/2`;
      const result = parseCsv(csv);
      expect(result).toHaveLength(2);
    });

    it("handles optional keyword column", () => {
      const csv = `title,description,url,keyword
My Page,My desc,https://example.com,SEO tips`;
      const result = parseCsv(csv);
      expect(result[0].keyword).toBe("SEO tips");
    });
  });

  describe("scoreBulkRow", () => {
    it("scores a row with all fields", () => {
      const row = {
        title: "Best SEO Tips for Content Creators",
        description: "A".repeat(150),
        url: "https://example.com",
        keyword: "SEO tips",
      };
      const result = scoreBulkRow(row);
      expect(result.titleScore).toBeGreaterThan(0);
      expect(result.descriptionScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeGreaterThan(0);
    });

    it("scores an empty row as errors", () => {
      const result = scoreBulkRow({ title: "", description: "", url: "" });
      expect(result.titleStatus).toBe("error");
      expect(result.descriptionStatus).toBe("error");
      expect(result.overallScore).toBe(0);
    });
  });

  describe("processBulkRows", () => {
    it("processes up to 500 rows", () => {
      const rows = Array.from({ length: 600 }, (_, i) => ({
        title: `Title ${i}`,
        description: "A".repeat(150),
        url: `https://example.com/${i}`,
      }));
      const results = processBulkRows(rows);
      expect(results).toHaveLength(500);
    });
  });

  describe("exportResultsToCsv", () => {
    it("generates valid CSV with headers", () => {
      const row = {
        title: "Test Title",
        description: "A".repeat(150),
        url: "https://example.com",
        keyword: "test",
        titleScore: 100,
        titleStatus: "good" as const,
        titleMessage: "Perfect",
        descriptionScore: 100,
        descriptionStatus: "good" as const,
        descriptionMessage: "Optimal",
        keywordScore: 100,
        keywordStatus: "good" as const,
        overallScore: 100,
      };
      const csv = exportResultsToCsv([row]);
      expect(csv).toContain("Title");
      expect(csv).toContain("Overall Score");
      expect(csv).toContain("Test Title");
    });

    it("escapes commas in values", () => {
      const row = {
        title: "Title, with comma",
        description: "A".repeat(150),
        url: "https://example.com",
        titleScore: 100,
        titleStatus: "good" as const,
        titleMessage: "Good",
        descriptionScore: 100,
        descriptionStatus: "good" as const,
        descriptionMessage: "Good",
        keywordScore: 0,
        keywordStatus: "error" as const,
        overallScore: 80,
      };
      const csv = exportResultsToCsv([row]);
      expect(csv).toContain('"Title, with comma"');
    });

    it("escapes double quotes inside values", () => {
      const row = {
        title: 'Title with "quotes"',
        description: "A".repeat(150),
        url: "https://example.com",
        titleScore: 100,
        titleStatus: "good" as const,
        titleMessage: "Good",
        descriptionScore: 100,
        descriptionStatus: "good" as const,
        descriptionMessage: "Good",
        keywordScore: 0,
        keywordStatus: "error" as const,
        overallScore: 80,
      };
      const csv = exportResultsToCsv([row]);
      // CSV escaping: double quotes become ""
      expect(csv).toContain('""quotes""');
    });

    it("produces the correct number of header columns", () => {
      const row = {
        title: "T",
        description: "D",
        url: "U",
        titleScore: 0,
        titleStatus: "error" as const,
        titleMessage: "M",
        descriptionScore: 0,
        descriptionStatus: "error" as const,
        descriptionMessage: "M",
        keywordScore: 0,
        keywordStatus: "error" as const,
        overallScore: 0,
      };
      const csv = exportResultsToCsv([row]);
      const headerLine = csv.split("\n")[0];
      // Headers: Title,Description,URL,Keyword,Overall Score,Title Score,Title Status,
      //          Title Feedback,Description Score,Description Status,Description Feedback,
      //          Keyword Score,Keyword Status  → 13 columns
      const columns = headerLine.split(",");
      expect(columns.length).toBe(13);
    });

    it("returns only the header row for an empty results array", () => {
      const csv = exportResultsToCsv([]);
      const lines = csv.trim().split("\n");
      expect(lines).toHaveLength(1); // only the header
    });

    it("handles multiple rows", () => {
      const makeRow = (title: string) => ({
        title,
        description: "A".repeat(150),
        url: "https://example.com",
        titleScore: 100,
        titleStatus: "good" as const,
        titleMessage: "Good",
        descriptionScore: 100,
        descriptionStatus: "good" as const,
        descriptionMessage: "Good",
        keywordScore: 0,
        keywordStatus: "error" as const,
        overallScore: 80,
      });
      const csv = exportResultsToCsv([makeRow("Row One"), makeRow("Row Two")]);
      expect(csv).toContain("Row One");
      expect(csv).toContain("Row Two");
    });
  });

  // ─── parseCsv edge cases ─────────────────────────────────────────────────────

  describe("parseCsv edge cases", () => {
    it("returns empty array when only the header row is present (no data)", () => {
      const csv = "title,description,url";
      expect(parseCsv(csv)).toHaveLength(0);
    });

    it("handles quoted fields with escaped double-quotes", () => {
      const csv = `title,description,url\n"He said ""hello""",Description,https://example.com`;
      const result = parseCsv(csv);
      expect(result[0].title).toBe('He said "hello"');
    });

    it("is case-insensitive for the 'title' column header", () => {
      const csv = `Title,Description,URL\nMy Page,My desc,https://example.com`;
      const result = parseCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("My Page");
    });

    it("is case-insensitive for the 'description' column header", () => {
      const csv = `title,Description,url\nPage,My Desc,https://example.com`;
      const result = parseCsv(csv);
      expect(result[0].description).toBe("My Desc");
    });

    it("handles missing optional columns gracefully", () => {
      const csv = `title\nJust A Title`;
      const result = parseCsv(csv);
      expect(result[0].description).toBe("");
      expect(result[0].url).toBe("");
      expect(result[0].keyword).toBeUndefined();
    });

    it("handles Windows-style line endings (CRLF)", () => {
      const csv = "title,description,url\r\nPage Title,Desc,https://example.com";
      const result = parseCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Page Title");
    });
  });
});
