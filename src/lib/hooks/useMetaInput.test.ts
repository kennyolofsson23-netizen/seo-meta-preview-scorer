import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMetaInput } from "./useMetaInput";

describe("useMetaInput", () => {
  it("initialises with example/placeholder values when no initial state given", () => {
    const { result } = renderHook(() => useMetaInput());
    expect(result.current.metadata.title.length).toBeGreaterThan(0);
    expect(result.current.metadata.url.length).toBeGreaterThan(0);
  });

  it("accepts partial initial overrides", () => {
    const { result } = renderHook(() =>
      useMetaInput({ title: "Custom Title", description: "Custom Desc" }),
    );
    expect(result.current.metadata.title).toBe("Custom Title");
    expect(result.current.metadata.description).toBe("Custom Desc");
  });

  it("merges override with defaults (non-overridden keys keep defaults)", () => {
    const { result } = renderHook(() => useMetaInput({ title: "Override" }));
    // url should still be the default example url
    expect(result.current.metadata.url).toBeTruthy();
  });

  it("updates metadata via setMetadata", () => {
    const { result } = renderHook(() => useMetaInput());
    act(() => {
      result.current.setMetadata({
        ...result.current.metadata,
        title: "Updated Title",
      });
    });
    expect(result.current.metadata.title).toBe("Updated Title");
  });

  it("re-computes scores after setMetadata", () => {
    const { result } = renderHook(() => useMetaInput({ title: "" }));
    expect(result.current.titleScore.status).toBe("error");

    act(() => {
      result.current.setMetadata({
        ...result.current.metadata,
        title: "A Good SEO Title Right Here",
      });
    });
    expect(result.current.titleScore.status).toBe("good");
  });

  it("returns valid URL validation for a valid URL", () => {
    const { result } = renderHook(() =>
      useMetaInput({ url: "https://example.com/page" }),
    );
    expect(result.current.urlValidation.valid).toBe(true);
  });

  it("returns invalid URL validation for a bad URL", () => {
    const { result } = renderHook(() =>
      useMetaInput({ url: "not-a-url" }),
    );
    expect(result.current.urlValidation.valid).toBe(false);
    expect(result.current.urlValidation.error).toBeDefined();
  });

  it("returns valid validation for empty URL (URL is optional)", () => {
    const { result } = renderHook(() => useMetaInput({ url: "" }));
    expect(result.current.urlValidation.valid).toBe(true);
  });

  it("detects mobile title truncation when title > 50 chars", () => {
    const { result } = renderHook(() =>
      useMetaInput({ title: "A".repeat(51) }),
    );
    expect(result.current.mobileTruncation.titleTruncated).toBe(true);
    expect(result.current.mobileTruncation.hasIssues).toBe(true);
  });

  it("detects mobile description truncation when description > 120 chars", () => {
    const { result } = renderHook(() =>
      useMetaInput({ description: "A".repeat(121) }),
    );
    expect(result.current.mobileTruncation.descriptionTruncated).toBe(true);
    expect(result.current.mobileTruncation.hasIssues).toBe(true);
  });

  it("no mobile truncation issues for short content", () => {
    const { result } = renderHook(() =>
      useMetaInput({ title: "Short", description: "Short desc" }),
    );
    expect(result.current.mobileTruncation.hasIssues).toBe(false);
  });

  it("computes correct overall score for perfect inputs", () => {
    const { result } = renderHook(() =>
      useMetaInput({
        title: "Best SEO Tips for 2024 | Complete Guide",
        description:
          "Discover the most effective SEO tips and strategies to boost your rankings in 2024. This comprehensive guide covers everything you need to succeed.",
        keyword: "SEO tips",
      }),
    );
    expect(result.current.overall).toBeGreaterThan(80);
  });

  it("exposes keyword score", () => {
    const { result } = renderHook(() =>
      useMetaInput({
        title: "SEO Best Practices",
        description: "A comprehensive SEO guide for beginners and experts.",
        keyword: "SEO",
      }),
    );
    expect(result.current.keywordScore.score).toBeGreaterThan(0);
  });
});
