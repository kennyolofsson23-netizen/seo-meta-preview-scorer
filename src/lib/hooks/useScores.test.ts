import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScores } from "./useScores";

describe("useScores", () => {
  it("returns good scores for perfect metadata", () => {
    const { result } = renderHook(() =>
      useScores({
        title: "Best SEO Tips for 2024 | Complete Guide",
        description: "A".repeat(155),
        keyword: "SEO tips",
      }),
    );
    expect(result.current.titleScore.status).toBe("good");
    expect(result.current.descriptionScore.status).toBe("good");
    expect(result.current.overall).toBeGreaterThan(80);
  });

  it("returns error scores for all-empty inputs", () => {
    const { result } = renderHook(() =>
      useScores({ title: "", description: "", keyword: "" }),
    );
    expect(result.current.titleScore.status).toBe("error");
    expect(result.current.descriptionScore.status).toBe("error");
    expect(result.current.overall).toBe(0);
  });

  it("returns keyword error when no keyword provided", () => {
    const { result } = renderHook(() =>
      useScores({
        title: "A Good Title Here",
        description: "A".repeat(155),
        keyword: "",
      }),
    );
    expect(result.current.keywordScore.status).toBe("error");
  });

  it("returns keyword score of 100 when keyword is in both title and description", () => {
    const { result } = renderHook(() =>
      useScores({
        title: "Best SEO Tips Available",
        description: "Learn the best SEO tips and strategies right here.",
        keyword: "SEO tips",
      }),
    );
    expect(result.current.keywordScore.score).toBe(100);
    expect(result.current.keywordScore.status).toBe("good");
  });

  it("detects mobile title truncation at 51 chars", () => {
    const { result } = renderHook(() =>
      useScores({
        title: "A".repeat(51),
        description: "Short desc",
        keyword: "",
      }),
    );
    expect(result.current.mobileTruncation.titleTruncated).toBe(true);
    expect(result.current.mobileTruncation.totalIssues).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("detects mobile description truncation at 121 chars", () => {
    const { result } = renderHook(() =>
      useScores({
        title: "Short title",
        description: "A".repeat(121),
        keyword: "",
      }),
    );
    expect(result.current.mobileTruncation.descriptionTruncated).toBe(true);
  });

  it("exposes title and description lengths in mobileTruncation", () => {
    const { result } = renderHook(() =>
      useScores({ title: "Hello", description: "World!", keyword: "" }),
    );
    expect(result.current.mobileTruncation.titleLength).toBe(5);
    expect(result.current.mobileTruncation.descriptionLength).toBe(6);
  });

  it("no mobile truncation issues for content within limits", () => {
    const { result } = renderHook(() =>
      useScores({
        title: "A".repeat(50),
        description: "A".repeat(120),
        keyword: "",
      }),
    );
    expect(result.current.mobileTruncation.titleTruncated).toBe(false);
    expect(result.current.mobileTruncation.descriptionTruncated).toBe(false);
    expect(result.current.mobileTruncation.totalIssues).toBe(0);
  });

  it("calculates overall score as weighted average (40/40/20)", () => {
    // title score = 100 (good, ~30 chars), desc score = 100 (155 chars), keyword = 90 (title only)
    // overall = 100*0.4 + 100*0.4 + 90*0.2 = 40+40+18 = 98
    const { result } = renderHook(() =>
      useScores({
        title: "Best SEO Tips for 2024 | Complete Guide",
        description: "A".repeat(155),
        keyword: "SEO tips",
      }),
    );
    expect(result.current.overall).toBeGreaterThanOrEqual(90);
    expect(result.current.overall).toBeLessThanOrEqual(100);
  });

  it("re-computes when title changes (memo invalidation)", () => {
    const { result, rerender } = renderHook(
      ({ title }: { title: string }) =>
        useScores({ title, description: "A".repeat(155), keyword: "" }),
      { initialProps: { title: "" } },
    );
    expect(result.current.titleScore.status).toBe("error");
    rerender({ title: "A Good Title For SEO Testing Now" });
    expect(result.current.titleScore.status).toBe("good");
  });

  it("re-computes when description changes", () => {
    const { result, rerender } = renderHook(
      ({ description }: { description: string }) =>
        useScores({ title: "Good Title", description, keyword: "" }),
      { initialProps: { description: "" } },
    );
    expect(result.current.descriptionScore.status).toBe("error");
    rerender({ description: "A".repeat(155) });
    expect(result.current.descriptionScore.status).toBe("good");
  });

  it("re-computes when keyword changes", () => {
    const { result, rerender } = renderHook(
      ({ keyword }: { keyword: string }) =>
        useScores({
          title: "Best SEO Content Here",
          description: "A".repeat(155),
          keyword,
        }),
      { initialProps: { keyword: "" } },
    );
    expect(result.current.keywordScore.score).toBe(0);
    rerender({ keyword: "SEO" });
    expect(result.current.keywordScore.score).toBeGreaterThan(0);
  });
});
