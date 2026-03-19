import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cn,
  truncate,
  formatDate,
  copyToClipboard,
  debounce,
  generateId,
  isBrowser,
  delay,
} from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes with false", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("merges tailwind classes correctly — last wins", () => {
      expect(cn("p-4", "p-2")).toBe("p-2");
    });

    it("handles undefined and null values", () => {
      expect(cn("foo", undefined, null as unknown as string, "bar")).toBe(
        "foo bar",
      );
    });

    it("returns empty string for no input", () => {
      expect(cn()).toBe("");
    });

    it("handles object syntax", () => {
      expect(cn({ "text-red-500": true, "text-green-500": false })).toBe(
        "text-red-500",
      );
    });

    it("deduplicates conflicting tailwind utilities", () => {
      const result = cn("bg-red-500", "bg-blue-500");
      expect(result).toBe("bg-blue-500");
    });
  });

  describe("truncate", () => {
    it("returns string unchanged when within limit", () => {
      expect(truncate("Hello", 10)).toBe("Hello");
    });

    it("truncates and appends ellipsis when over limit", () => {
      expect(truncate("Hello world", 5)).toBe("Hello…");
    });

    it("returns string unchanged at exact limit", () => {
      expect(truncate("Hello", 5)).toBe("Hello");
    });

    it("handles empty string", () => {
      expect(truncate("", 10)).toBe("");
    });

    it("truncates to zero length", () => {
      expect(truncate("Hello", 0)).toBe("…");
    });

    it("handles single character limit", () => {
      expect(truncate("Hello", 1)).toBe("H…");
    });
  });

  describe("formatDate", () => {
    it("formats a date in human-readable format", () => {
      const date = new Date(2024, 0, 15); // Jan 15 2024
      const result = formatDate(date);
      expect(result).toContain("2024");
      expect(result).toContain("January");
      expect(result).toContain("15");
    });

    it("formats a December date correctly", () => {
      const date = new Date(2023, 11, 31);
      const result = formatDate(date);
      expect(result).toContain("December");
      expect(result).toContain("31");
    });

    it("returns a non-empty string", () => {
      expect(formatDate(new Date())).toBeTruthy();
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("delays function execution", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("cancels previous calls when invoked rapidly", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("passes arguments to the wrapped function", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced("arg1", "arg2");
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("fires again after the wait period resets", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(100);
      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("does not fire if cancelled within wait window", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced(); // resets the timer
      vi.advanceTimersByTime(50); // only 50ms since last call
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50); // now 100ms since last call
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("generateId", () => {
    it("generates a string id", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("includes prefix when given", () => {
      const id = generateId("test-");
      expect(id.startsWith("test-")).toBe(true);
    });

    it("generates unique ids on successive calls", () => {
      const ids = new Set(Array.from({ length: 20 }, () => generateId()));
      expect(ids.size).toBe(20);
    });

    it("works with empty prefix", () => {
      const id = generateId("");
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("copyToClipboard", () => {
    it("UT-03: calls navigator.clipboard.writeText with the given text", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal("navigator", {
        ...navigator,
        clipboard: { writeText },
      });

      const result = await copyToClipboard("Hello clipboard");
      expect(writeText).toHaveBeenCalledWith("Hello clipboard");
      expect(result).toBe(true);

      vi.unstubAllGlobals();
    });

    it("returns false when clipboard.writeText throws", async () => {
      const writeText = vi
        .fn()
        .mockRejectedValue(new Error("Permission denied"));
      vi.stubGlobal("navigator", {
        ...navigator,
        clipboard: { writeText },
      });

      const result = await copyToClipboard("some text");
      expect(result).toBe(false);

      vi.unstubAllGlobals();
    });

    it("returns true and calls writeText once per invocation", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal("navigator", {
        ...navigator,
        clipboard: { writeText },
      });

      await copyToClipboard("first");
      await copyToClipboard("second");
      expect(writeText).toHaveBeenCalledTimes(2);
      expect(writeText).toHaveBeenNthCalledWith(1, "first");
      expect(writeText).toHaveBeenNthCalledWith(2, "second");

      vi.unstubAllGlobals();
    });
  });

  describe("isBrowser", () => {
    it("returns true in jsdom environment (window exists)", () => {
      expect(isBrowser()).toBe(true);
    });
  });

  describe("delay", () => {
    it("resolves after specified milliseconds", async () => {
      vi.useFakeTimers();
      const promise = delay(200);
      vi.advanceTimersByTime(200);
      await promise; // should not throw
      vi.useRealTimers();
    });

    it("resolves with undefined", async () => {
      vi.useFakeTimers();
      const promise = delay(0);
      vi.advanceTimersByTime(0);
      const result = await promise;
      expect(result).toBeUndefined();
      vi.useRealTimers();
    });
  });
});
