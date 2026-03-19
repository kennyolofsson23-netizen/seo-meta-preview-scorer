import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  parseCsv,
  scoreBulkRow,
  processBulkRows,
  exportResultsToCsv,
  downloadCsv,
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

    it("PR-03: returns empty array for zero input rows", () => {
      expect(processBulkRows([])).toEqual([]);
    });

    it("PR-01: perfect metadata row scores overallScore === 100", () => {
      const rows = [
        {
          title: "Best SEO Meta Description Tips for Bloggers",
          description:
            "Write meta descriptions that earn more clicks — learn the right length, structure, and tone that Google actually rewards, with before-and-after examples.",
          url: "https://yourblog.com/meta-description-guide",
          keyword: "meta description",
        },
      ];
      const results = processBulkRows(rows);
      expect(results[0].overallScore).toBe(100);
    });

    it("PR-02: slices exactly to 500 when input has 501 rows", () => {
      const rows = Array.from({ length: 501 }, (_, i) => ({
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
      const csv =
        "title,description,url\r\nPage Title,Desc,https://example.com";
      const result = parseCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Page Title");
    });
  });

  // ─── downloadCsv ─────────────────────────────────────────────────────────────
  // Requires DOM mocks for URL.createObjectURL and document.createElement

  describe("downloadCsv", () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue("blob:fake-csv-url");
    const mockRevokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);

    beforeEach(() => {
      mockCreateObjectURL.mockClear();
      mockRevokeObjectURL.mockClear();
      mockClick.mockClear();

      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        value: mockRevokeObjectURL,
        writable: true,
        configurable: true,
      });

      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "a") {
          const el = originalCreateElement("a");
          el.click = mockClick;
          return el;
        }
        return originalCreateElement(tag);
      });
    });

    it("DC-01: creates an anchor element with a 'download' attribute", () => {
      downloadCsv("col1,col2\nval1,val2", "test.csv");
      // createElement("a") was called
      expect(document.createElement).toHaveBeenCalledWith("a");
    });

    it("DC-01b: the anchor has the correct download filename", () => {
      let capturedEl: HTMLAnchorElement | null = null;
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        const el = originalCreateElement(tag as keyof HTMLElementTagNameMap);
        if (tag === "a") {
          el.click = mockClick;
          capturedEl = el as HTMLAnchorElement;
        }
        return el;
      });

      downloadCsv("header\nvalue", "my-results.csv");
      expect(capturedEl).not.toBeNull();
      expect((capturedEl as unknown as HTMLAnchorElement).download).toBe(
        "my-results.csv",
      );
    });

    it("DC-02: URL.createObjectURL is called with a Blob", () => {
      downloadCsv("data", "output.csv");
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    });

    it("DC-02b: the Blob has CSV content type", () => {
      downloadCsv("data", "output.csv");
      const [blob] = mockCreateObjectURL.mock.calls[0] as [Blob];
      expect(blob.type).toContain("text/csv");
    });

    it("DC-03: URL.revokeObjectURL is called to prevent memory leaks", () => {
      downloadCsv("data", "output.csv");
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:fake-csv-url");
    });

    it("uses the default filename when none is provided", () => {
      let capturedEl: HTMLAnchorElement | null = null;
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        const el = originalCreateElement(tag as keyof HTMLElementTagNameMap);
        if (tag === "a") {
          el.click = mockClick;
          capturedEl = el as HTMLAnchorElement;
        }
        return el;
      });

      downloadCsv("col\nval");
      expect((capturedEl as unknown as HTMLAnchorElement).download).toBe(
        "seo-bulk-results.csv",
      );
    });

    it("click() is called on the anchor to trigger the download", () => {
      downloadCsv("data", "test.csv");
      expect(mockClick).toHaveBeenCalled();
    });
  });
});
