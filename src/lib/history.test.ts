import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  readHistory,
  saveHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
  formatHistoryDate,
} from "./history";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("history", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("readHistory", () => {
    it("returns empty array when no history exists", () => {
      expect(readHistory()).toEqual([]);
    });

    it("returns parsed history from localStorage", () => {
      const entry = {
        id: "1",
        title: "Test Title",
        description: "Test Desc",
        url: "https://example.com",
        keyword: "",
        overallScore: 80,
        timestamp: Date.now(),
      };
      localStorageMock.setItem("seo-preview-history", JSON.stringify([entry]));
      const result = readHistory();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Test Title");
    });

    it("returns empty array for corrupt JSON", () => {
      localStorageMock.setItem("seo-preview-history", "invalid json");
      expect(readHistory()).toEqual([]);
    });
  });

  describe("saveHistoryEntry", () => {
    it("saves a new entry", () => {
      const entry = saveHistoryEntry({
        title: "Test Title",
        description: "Test Desc",
        url: "https://example.com",
        keyword: "test",
        overallScore: 75,
      });
      expect(entry).not.toBeNull();
      expect(readHistory()).toHaveLength(1);
      expect(readHistory()[0].title).toBe("Test Title");
    });

    it("prepends new entries to front", () => {
      saveHistoryEntry({
        title: "First",
        description: "Desc",
        url: "https://example.com",
        keyword: "",
        overallScore: 50,
      });
      saveHistoryEntry({
        title: "Second",
        description: "Desc",
        url: "https://example.com/2",
        keyword: "",
        overallScore: 60,
      });
      const history = readHistory();
      expect(history[0].title).toBe("Second");
    });

    it("deduplicates same title+description+url", () => {
      const entry = {
        title: "Same Title",
        description: "Same Desc",
        url: "https://example.com",
        keyword: "",
        overallScore: 80,
      };
      saveHistoryEntry(entry);
      saveHistoryEntry(entry);
      expect(readHistory()).toHaveLength(1);
    });

    it("trims to max 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        saveHistoryEntry({
          title: `Title ${i}`,
          description: "Desc",
          url: `https://example.com/${i}`,
          keyword: "",
          overallScore: 50,
        });
      }
      expect(readHistory()).toHaveLength(20);
    });
  });

  describe("deleteHistoryEntry", () => {
    it("removes entry by id", () => {
      const entry = saveHistoryEntry({
        title: "Test",
        description: "Desc",
        url: "https://example.com",
        keyword: "",
        overallScore: 80,
      });
      expect(entry).not.toBeNull();
      deleteHistoryEntry(entry!.id);
      expect(readHistory()).toHaveLength(0);
    });
  });

  describe("clearHistory", () => {
    it("removes all history", () => {
      saveHistoryEntry({
        title: "Test",
        description: "Desc",
        url: "https://example.com",
        keyword: "",
        overallScore: 80,
      });
      clearHistory();
      expect(readHistory()).toHaveLength(0);
    });
  });

  describe("formatHistoryDate", () => {
    it('shows "Just now" for very recent timestamps', () => {
      expect(formatHistoryDate(Date.now())).toBe("Just now");
    });

    it("shows minutes ago for recent timestamps", () => {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      expect(formatHistoryDate(fiveMinAgo)).toBe("5m ago");
    });

    it("shows hours ago for older timestamps", () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(formatHistoryDate(twoHoursAgo)).toBe("2h ago");
    });

    it("shows days ago for timestamps 1-6 days old", () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      expect(formatHistoryDate(threeDaysAgo)).toBe("3d ago");
    });

    it("shows days ago for 6 days (still within the 7-day window)", () => {
      const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
      expect(formatHistoryDate(sixDaysAgo)).toBe("6d ago");
    });

    it("shows locale date string for timestamps older than 7 days", () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const result = formatHistoryDate(eightDaysAgo);
      // Should not be in relative format — should look like "Jan 1" or similar
      expect(result).not.toMatch(/ago$/);
      expect(result.length).toBeGreaterThan(0);
    });

    it('shows "1m ago" for exactly 60 seconds ago', () => {
      const oneMinAgo = Date.now() - 60 * 1000;
      expect(formatHistoryDate(oneMinAgo)).toBe("1m ago");
    });
  });

  // ─── readHistory robustness ───────────────────────────────────────────────────

  describe("readHistory robustness", () => {
    it("returns empty array when localStorage contains non-array JSON", () => {
      localStorageMock.setItem(
        "seo-preview-history",
        JSON.stringify({ not: "an array" }),
      );
      expect(readHistory()).toEqual([]);
    });

    it("returns empty array when localStorage value is null", () => {
      localStorageMock.clear();
      expect(readHistory()).toEqual([]);
    });
  });

  // ─── deleteHistoryEntry edge cases ────────────────────────────────────────────

  describe("deleteHistoryEntry edge cases", () => {
    it("does not throw when deleting a non-existent ID", () => {
      expect(() => deleteHistoryEntry("does-not-exist")).not.toThrow();
    });

    it("leaves existing entries intact when ID is not found", () => {
      saveHistoryEntry({
        title: "Keep",
        description: "Desc",
        url: "https://example.com",
        keyword: "",
        overallScore: 80,
      });
      deleteHistoryEntry("not-a-real-id");
      expect(readHistory()).toHaveLength(1);
    });
  });

  // ─── saveHistoryEntry edge cases ──────────────────────────────────────────────

  describe("saveHistoryEntry edge cases", () => {
    it("assigns a unique id to each new entry", () => {
      const a = saveHistoryEntry({
        title: "A",
        description: "D",
        url: "https://a.com",
        keyword: "",
        overallScore: 50,
      });
      const b = saveHistoryEntry({
        title: "B",
        description: "D",
        url: "https://b.com",
        keyword: "",
        overallScore: 50,
      });
      expect(a!.id).not.toBe(b!.id);
    });

    it("assigns a timestamp close to Date.now()", () => {
      const before = Date.now();
      const entry = saveHistoryEntry({
        title: "T",
        description: "D",
        url: "https://example.com",
        keyword: "",
        overallScore: 50,
      });
      const after = Date.now();
      expect(entry!.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry!.timestamp).toBeLessThanOrEqual(after);
    });
  });
});
