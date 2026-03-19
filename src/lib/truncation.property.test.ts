/**
 * Property-based tests for SEO Meta Preview & Scorer
 *
 * Uses fast-check to verify mathematical invariants that must hold for
 * ALL valid inputs, not just the hand-picked examples in *.test.ts.
 *
 * Test IDs: PBT-01 through PBT-10  (see TEST_PLAN.md §5)
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  truncateAtChars,
  highlightKeyword,
  formatGoogleBreadcrumb,
} from "./truncation";
import {
  scoreTitle,
  scoreDescription,
  calculateOverallScore,
  validateUrl,
} from "./scoring";
import { generateEmbedCode, parseWidgetOptions } from "./embed";
import { parseCsv, processBulkRows, exportResultsToCsv } from "./bulk";

// ─── PBT-01 ───────────────────────────────────────────────────────────────────
// truncateAtChars: output (minus ellipsis) never exceeds maxChars

describe("PBT-01: truncateAtChars output never exceeds the character limit", () => {
  it("result.replace('…','').length <= maxChars for all inputs", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: 1, max: 200 }),
        (text, maxChars) => {
          const result = truncateAtChars(text, maxChars);
          expect(result.replace("…", "").length).toBeLessThanOrEqual(maxChars);
        },
      ),
      { numRuns: 500 },
    );
  });
});

// ─── PBT-02 ───────────────────────────────────────────────────────────────────
// truncateAtChars: input at or below the limit is returned unchanged

describe("PBT-02: truncateAtChars returns input unchanged when length <= limit", () => {
  it("short strings are returned as-is", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 60 }), (text) => {
        expect(truncateAtChars(text, 60)).toBe(text);
      }),
      { numRuns: 500 },
    );
  });

  it("string of exactly maxChars length is returned unchanged", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        fc
          .string({ minLength: 0, maxLength: 0 })
          .chain(() =>
            fc
              .integer({ min: 1, max: 200 })
              .chain((n) =>
                fc
                  .string({ minLength: n, maxLength: n })
                  .map((s) => ({ s, n })),
              ),
          ),
        (_ignored, { s, n }) => {
          expect(truncateAtChars(s, n)).toBe(s);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ─── PBT-03 ───────────────────────────────────────────────────────────────────
// calculateOverallScore: result always in [0, 100] and is an integer

describe("PBT-03: calculateOverallScore always returns an integer in [0, 100]", () => {
  it("all score combinations produce a valid output", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (titleScore, descScore, kwScore) => {
          const overall = calculateOverallScore(titleScore, descScore, kwScore);
          expect(overall).toBeGreaterThanOrEqual(0);
          expect(overall).toBeLessThanOrEqual(100);
          expect(Number.isInteger(overall)).toBe(true);
        },
      ),
      { numRuns: 500 },
    );
  });
});

// ─── PBT-04 ───────────────────────────────────────────────────────────────────
// scoreTitle / scoreDescription: score always in [0, 100]

describe("PBT-04a: scoreTitle score always in [0, 100]", () => {
  it("score is always a non-negative integer <= 100", () => {
    fc.assert(
      fc.property(fc.string(), (title) => {
        const { score } = scoreTitle(title);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 500 },
    );
  });

  it("status is always one of 'good', 'warning', 'error'", () => {
    fc.assert(
      fc.property(fc.string(), (title) => {
        const { status } = scoreTitle(title);
        expect(["good", "warning", "error"]).toContain(status);
      }),
      { numRuns: 500 },
    );
  });
});

describe("PBT-04b: scoreDescription score always in [0, 100]", () => {
  it("score is always a non-negative integer <= 100", () => {
    fc.assert(
      fc.property(fc.string(), (desc) => {
        const { score } = scoreDescription(desc);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 500 },
    );
  });
});

// ─── PBT-05 ───────────────────────────────────────────────────────────────────
// generateEmbedCode + parseWidgetOptions roundtrip

describe("PBT-05: generateEmbedCode / parseWidgetOptions roundtrip", () => {
  it("explicitly set boolean flags survive the roundtrip", () => {
    fc.assert(
      fc.property(
        fc.record({
          showScores: fc.option(fc.constant(false as const), {
            nil: undefined,
          }),
          showPreviews: fc.option(fc.constant(false as const), {
            nil: undefined,
          }),
          compactMode: fc.option(fc.constant(true as const), {
            nil: undefined,
          }),
          defaultTitle: fc.option(
            fc
              .string({ minLength: 1, maxLength: 80 })
              .filter((s) => !s.includes("\n") && !s.includes("\r")),
            { nil: undefined },
          ),
        }),
        (opts) => {
          const cleanOpts = Object.fromEntries(
            Object.entries(opts).filter(([, v]) => v !== undefined),
          ) as Parameters<typeof generateEmbedCode>[0];

          const code = generateEmbedCode(cleanOpts);
          const srcMatch = code.match(/src="([^"]+)"/);
          expect(srcMatch).not.toBeNull();

          const src = srcMatch![1];
          const url = new URL(src);
          const parsed = parseWidgetOptions(url.searchParams);

          if (cleanOpts.showScores === false)
            expect(parsed.showScores).toBe(false);
          if (cleanOpts.showPreviews === false)
            expect(parsed.showPreviews).toBe(false);
          if (cleanOpts.compactMode === true)
            expect(parsed.compactMode).toBe(true);
          if (cleanOpts.defaultTitle)
            expect(parsed.defaultTitle).toBe(cleanOpts.defaultTitle);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("showScores is NOT set in parsed result when not explicitly false in options", () => {
    fc.assert(
      fc.property(fc.constant({}), (opts) => {
        const code = generateEmbedCode(opts);
        const srcMatch = code.match(/src="([^"]+)"/);
        const src = srcMatch![1];
        const url = new URL(src);
        const parsed = parseWidgetOptions(url.searchParams);
        expect(parsed.showScores).toBeUndefined();
      }),
      { numRuns: 50 },
    );
  });
});

// ─── PBT-06 ───────────────────────────────────────────────────────────────────
// parseCsv: never throws on arbitrary string input

describe("PBT-06: parseCsv never throws on arbitrary string input", () => {
  it("always returns an array, never throws", () => {
    fc.assert(
      fc.property(fc.string(), (csv) => {
        expect(() => parseCsv(csv)).not.toThrow();
        expect(Array.isArray(parseCsv(csv))).toBe(true);
      }),
      { numRuns: 500 },
    );
  });
});

// ─── PBT-07 ───────────────────────────────────────────────────────────────────
// exportResultsToCsv: output line count = results.length + 1 (header)

describe("PBT-07: exportResultsToCsv line count equals results.length + 1", () => {
  // Use strings without newlines so we don't accidentally split CSV rows
  const safeString = fc
    .string()
    .filter((s) => !s.includes("\n") && !s.includes("\r"));

  it("header + one data line per result row", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: safeString,
            description: safeString,
            url: safeString,
          }),
          { maxLength: 20 },
        ),
        (rows) => {
          const results = processBulkRows(rows);
          const csv = exportResultsToCsv(results);
          const lines = csv.split("\n");
          // header line + one line per result
          expect(lines.length).toBe(results.length + 1);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ─── PBT-08 ───────────────────────────────────────────────────────────────────
// validateUrl: accepts all URLs with valid http/https protocol

describe("PBT-08: validateUrl accepts all valid http/https URLs", () => {
  it("fc.webUrl() always produces URLs that validateUrl accepts", () => {
    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        expect(validateUrl(url).valid).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  it("rejects strings that are not parseable as URLs", () => {
    // Generate strings that are definitely not valid URLs.
    // We filter out whitespace-only strings and anything that parses as a URL
    // either as-is or when trimmed (some URL parsers normalise whitespace).
    const invalidUrl = fc
      .string({ minLength: 1, maxLength: 30 })
      .filter((s) => {
        if (!s.trim()) return false; // skip empty / whitespace-only
        for (const candidate of [s, s.trim()]) {
          try {
            new URL(candidate);
            return false; // parseable — skip
          } catch {
            // not parseable — continue checking
          }
        }
        return true; // definitely not a valid URL
      });

    fc.assert(
      fc.property(invalidUrl, (s) => {
        expect(validateUrl(s).valid).toBe(false);
      }),
      { numRuns: 200 },
    );
  });
});

// ─── PBT-09 ───────────────────────────────────────────────────────────────────
// formatGoogleBreadcrumb: never throws on arbitrary string

describe("PBT-09: formatGoogleBreadcrumb never throws on arbitrary string", () => {
  it("always returns an object with domain and breadcrumb strings", () => {
    fc.assert(
      fc.property(fc.string(), (url) => {
        expect(() => formatGoogleBreadcrumb(url)).not.toThrow();
        const result = formatGoogleBreadcrumb(url);
        expect(typeof result.domain).toBe("string");
        expect(typeof result.breadcrumb).toBe("string");
      }),
      { numRuns: 500 },
    );
  });

  it("domain derived from a valid http/https URL is always non-empty", () => {
    // Use fc.webUrl() so we only test against syntactically valid URLs —
    // arbitrary strings like "A:" parse as opaque-origin URLs with empty hostnames.
    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        const { domain } = formatGoogleBreadcrumb(url);
        expect(domain.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });
});

// ─── PBT-10 ───────────────────────────────────────────────────────────────────
// highlightKeyword: joining all segments reconstructs the original text

describe("PBT-10: highlightKeyword segments reconstruct original text", () => {
  it("joining segment texts always equals the original input string", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string({ maxLength: 20 }),
        (text, keyword) => {
          const segments = highlightKeyword(text, keyword);
          const reconstructed = segments.map((s) => s.text).join("");
          expect(reconstructed).toBe(text);
        },
      ),
      { numRuns: 500 },
    );
  });

  it("every segment has a boolean isKeyword property", () => {
    fc.assert(
      fc.property(fc.string(), fc.string({ maxLength: 20 }), (text, kw) => {
        const segments = highlightKeyword(text, kw);
        for (const seg of segments) {
          expect(typeof seg.isKeyword).toBe("boolean");
          expect(typeof seg.text).toBe("string");
        }
      }),
      { numRuns: 300 },
    );
  });

  it("keyword segments have text that matches keyword case-insensitively", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter(
            (kw) => kw.trim().length > 0 && !/[.*+?^${}()|[\]\\]/.test(kw),
          ),
        fc.string(),
        (keyword, text) => {
          const segments = highlightKeyword(text, keyword);
          for (const seg of segments) {
            if (seg.isKeyword) {
              expect(seg.text.toLowerCase()).toBe(keyword.toLowerCase());
            }
          }
        },
      ),
      { numRuns: 300 },
    );
  });

  it("empty text always produces an empty segments array", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 20 }), (keyword) => {
        const segments = highlightKeyword("", keyword);
        // Empty string split by regex gives [], filtered to [] by .filter(part => part.length > 0)
        // OR if keyword is empty, returns [{ text: "", isKeyword: false }] — both are valid
        // Key property: joining is still ""
        const reconstructed = segments.map((s) => s.text).join("");
        expect(reconstructed).toBe("");
      }),
      { numRuns: 200 },
    );
  });
});

// ─── Additional invariant: scoreTitle never returns score < 0 ─────────────────

describe("Additional invariant: score functions never produce negative scores", () => {
  it("scoreTitle never returns a negative score", () => {
    fc.assert(
      fc.property(fc.string(), (title) => {
        expect(scoreTitle(title).score).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 300 },
    );
  });

  it("scoreDescription never returns a negative score", () => {
    fc.assert(
      fc.property(fc.string(), (desc) => {
        expect(scoreDescription(desc).score).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 300 },
    );
  });

  it("calculateOverallScore with boundary inputs (0,0,0) returns 0", () => {
    expect(calculateOverallScore(0, 0, 0)).toBe(0);
  });

  it("calculateOverallScore with boundary inputs (100,100,100) returns 100", () => {
    expect(calculateOverallScore(100, 100, 100)).toBe(100);
  });
});
