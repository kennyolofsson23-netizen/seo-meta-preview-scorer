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
  });
});
