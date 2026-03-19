# SEO Meta Preview & Scorer — Test Plan

## Table of Contents

1. [Test Strategy & Pyramid](#1-test-strategy--pyramid)
2. [Unit Tests](#2-unit-tests)
3. [Integration Tests](#3-integration-tests)
4. [E2E Tests](#4-e2e-tests)
5. [Property-Based Test Candidates](#5-property-based-test-candidates)
6. [Per-Module Coverage Targets](#6-per-module-coverage-targets)
7. [Acceptance Criteria Traceability Matrix](#7-acceptance-criteria-traceability-matrix)

---

## 1. Test Strategy & Pyramid

### Project Profile

This is a **client-side-dominant** tool. Core business logic (`scoring.ts`, `truncation.ts`, `bulk.ts`, `embed.ts`, `history.ts`) consists almost entirely of pure, synchronous functions with no I/O. Only two API routes exist: one edge function for OG image generation, one Node.js proxy for URL fetching. There is no database, no auth, and no mutation API surface.

This profile drives a **bottom-heavy pyramid**: thorough unit coverage of pure logic, focused component tests for rendering fidelity, and slim but high-value E2E tests for full user journeys.

### Test Pyramid

```
         ┌───────────────────────────────┐
         │      E2E  (Playwright)        │  ~12%   ≈ 20 scenarios
         │  Full user flows, a11y, perf  │
         ├───────────────────────────────┤
         │  Component (Vitest + RTL)     │  ~28%   ≈ 45 test cases
         │  Rendering, interaction, UI   │
         ├───────────────────────────────┤
         │  Unit (Vitest)                │  ~60%   ≈ 100 test cases
         │  Pure fns, hooks, API routes  │
         └───────────────────────────────┘
```

### Tool Assignments

| Layer | Tool | Location |
|---|---|---|
| Unit | Vitest | `src/lib/**/*.test.ts`, `src/app/api/**/*.test.ts` |
| Component | Vitest + React Testing Library | `src/components/**/*.test.tsx` |
| E2E | Playwright | `e2e/**/*.spec.ts` |
| Property-based | `fast-check` via Vitest | `src/lib/**/*.property.test.ts` |

### Key Testing Principles

1. **Scoring logic is pure** — test every branch in isolation without React or mocks.
2. **Previews are render tests** — assert that truncated text, keyword bolding, and styled dimensions are present in the DOM, not that pixels match visually.
3. **localStorage** — test with a real in-memory mock (`vi.stubGlobal` + fake storage); also test the unavailable-storage path.
4. **html2canvas** — always mock it in unit/component tests; verify integration with a real dynamic import only in E2E.
5. **API routes** — use `msw` or `vi.fn` stubs for `fetch` in unit tests; test actual HTTP responses in E2E or with Next.js test server.

---

## 2. Unit Tests

### 2.1 `src/lib/scoring.ts`

File: `src/lib/scoring.test.ts`

#### `scoreTitle(title: string): ScoringResult`

| Test ID | Input | Expected `status` | Expected `score` | Notes |
|---|---|---|---|---|
| ST-01 | `""` (empty) | `"error"` | `0` | AC: F004-1 |
| ST-02 | `"Hi"` (2 chars) | `"error"` | `40` | < 10 chars branch |
| ST-03 | `"A".repeat(9)` (9 chars) | `"error"` | `40` | boundary: 9 < 10 |
| ST-04 | `"A".repeat(10)` (10 chars) | `"good"` | `100` | boundary: exactly 10 |
| ST-05 | `"A".repeat(30)` (30 chars) | `"good"` | `100` | AC: F004-1 green lower bound |
| ST-06 | `"A".repeat(60)` (60 chars) | `"good"` | `100` | AC: F004-1 green upper bound |
| ST-07 | `"A".repeat(61)` (61 chars) | `"warning"` | `80` | AC: F004-1 yellow range start |
| ST-08 | `"A".repeat(70)` (70 chars) | `"warning"` | `80` | AC: F004-1 yellow range end |
| ST-09 | `"A".repeat(71)` (71 chars) | `"error"` | `50` | AC: F004-1 red > 70 |
| ST-10 | `"A".repeat(150)` (150 chars) | `"error"` | `50` | long title |
| ST-11 | message contains char count | — | — | message includes `length` for debugging |

**Edge cases**: Unicode characters (emoji) count as single chars in JS `.length`; multi-word title at exactly 60 chars.

#### `scoreDescription(description: string): ScoringResult`

| Test ID | Input | Expected `status` | Expected `score` |
|---|---|---|---|
| SD-01 | `""` | `"error"` | `0` |
| SD-02 | `"Too short."` (10 chars) | `"warning"` | `60` |
| SD-03 | `"A".repeat(119)` | `"warning"` | `60` |
| SD-04 | `"A".repeat(120)` | `"good"` | `100` | AC: F004-2 green lower bound |
| SD-05 | `"A".repeat(160)` | `"good"` | `100` | AC: F004-2 green upper bound |
| SD-06 | `"A".repeat(161)` | `"warning"` | `80` | AC: F004-2 yellow range |
| SD-07 | `"A".repeat(200)` | `"warning"` | `80` | AC: F004-2 yellow upper |
| SD-08 | `"A".repeat(201)` | `"error"` | `50` | AC: F004-2 red > 200 |
| SD-09 | `"A".repeat(250)` | `"error"` | `50` | very long |

#### `scoreKeywordPresence(title, description, keyword): ScoringResult`

| Test ID | Scenario | Expected `score` | Expected `status` |
|---|---|---|---|
| SK-01 | Empty keyword | `0` | `"error"` | AC: F004-3 |
| SK-02 | Keyword only whitespace | `0` | `"error"` |
| SK-03 | Keyword in title AND description (exact phrase) | `100` | `"good"` | AC: F004-3 |
| SK-04 | Keyword in title AND description (any word from phrase in desc) | `100` | `"good"` |
| SK-05 | Keyword in title only | `90` | `"good"` |
| SK-06 | Keyword in description only | `70` | `"warning"` |
| SK-07 | Keyword absent from both | `0` | `"error"` |
| SK-08 | Case-insensitive match (`"SEO"` vs `"seo"`) | `100` | `"good"` |
| SK-09 | Multi-word keyword (`"SEO tips"`) in title | `90` | `"good"` |
| SK-10 | Keyword match is substring of larger word (e.g. `"seo"` in `"seoa"`) — should still match | check `.includes()` behavior | — |

#### `checkMobileTruncation(title, description)`

| Test ID | title.length | desc.length | titleTruncated | descriptionTruncated | totalIssues |
|---|---|---|---|---|---|
| CM-01 | 50 | 120 | `false` | `false` | `0` | AC: F004-4 boundary |
| CM-02 | 51 | 120 | `true` | `false` | `1` |
| CM-03 | 50 | 121 | `false` | `true` | `1` |
| CM-04 | 51 | 121 | `true` | `true` | `2` |
| CM-05 | 0 | 0 | `false` | `false` | `0` |

#### `calculateOverallScore(titleScore, descriptionScore, keywordScore): number`

| Test ID | titleScore | descScore | kwScore | Expected overall |
|---|---|---|---|---|
| CO-01 | 100 | 100 | 100 | `100` | AC: F004-5 |
| CO-02 | 100 | 100 | 0 | `80` | 40+40+0 |
| CO-03 | 0 | 0 | 0 | `0` |
| CO-04 | 80 | 60 | 50 | `66` | 32+24+10 |
| CO-05 | 50 | 50 | 50 | `50` | flat mid |
| CO-06 | 100 | 80 | 90 | `90` | 40+32+18 |

**Assert**: Always returns integer (Math.round applied), range [0, 100].

#### `validateUrl(url: string)`

| Test ID | Input | `valid` | Has `error` |
|---|---|---|---|
| VU-01 | `""` | `true` | no (optional) |
| VU-02 | `"https://example.com"` | `true` | no |
| VU-03 | `"http://example.com/path"` | `true` | no |
| VU-04 | `"not-a-url"` | `false` | yes |
| VU-05 | `"example.com/page"` (no protocol) | `false` | yes |
| VU-06 | `"ftp://example.com"` | `true` | no (URL constructor accepts ftp) |

#### `extractDomain(url: string)` / `extractSlug(url: string)`

| Test ID | Input | `extractDomain` | `extractSlug` |
|---|---|---|---|
| ED-01 | `""` | `"example.com"` | `""` |
| ED-02 | `"https://example.com"` | `"example.com"` | `""` |
| ED-03 | `"https://myblog.com/seo/guide"` | `"myblog.com"` | `"guide"` |
| ED-04 | `"not-a-url"` | `"example.com"` | `""` |

#### `getScoreColor(status)` / `formatScore(score)`

- `getScoreColor("good")` → contains `"green"`
- `getScoreColor("warning")` → contains `"yellow"`
- `getScoreColor("error")` → contains `"red"`
- `formatScore(85)` → `"85%"`; `formatScore(0)` → `"0%"`; `formatScore(100)` → `"100%"`; `formatScore(-5)` → `"0%"` (clamp); `formatScore(105)` → `"100%"` (clamp)

---

### 2.2 `src/lib/truncation.ts`

File: `src/lib/truncation.test.ts`

#### `truncateAtChars(text, maxChars)`

| Test ID | Input | maxChars | Expected |
|---|---|---|---|
| TA-01 | `"Hello"` | 10 | `"Hello"` (no truncation) |
| TA-02 | `"A".repeat(60)` | 60 | `"A".repeat(60)` (exactly at limit) |
| TA-03 | `"A".repeat(61)` | 60 | `"AAAAAA…"` (hard cut + ellipsis) |
| TA-04 | `"Hello world foo bar"` | 12 | `"Hello world…"` (break at word boundary at pos 11) |
| TA-05 | `"Helloworld"` (no spaces) | 5 | `"Hello…"` (hard cut: no word boundary) |
| TA-06 | Word boundary > 10 chars before limit | — | falls back to hard cut |
| TA-07 | `""` | 60 | `""` |

**Derived platform functions**: Each just delegates to `truncateAtChars` with a fixed limit. Verify limits:

| Function | Expected `maxChars` |
|---|---|
| `truncateGoogleDesktopTitle` | 60 | AC: F002-3 |
| `truncateGoogleDesktopDescription` | 160 | AC: F002-4 |
| `truncateGoogleMobileTitle` | 50 | AC: F003-1 |
| `truncateGoogleMobileDescription` | 120 | AC: F003-2 |
| `truncateBingTitle` | 65 | AC: F005-2 |
| `truncateBingDescription` | 160 | AC: F005-3 |

For each: test at limit (no ellipsis), at limit+1 (ellipsis added).

#### `highlightKeyword(text, keyword): TextSegment[]`

| Test ID | text | keyword | Expected segments |
|---|---|---|---|
| HK-01 | `"Best SEO tips"` | `""` | `[{text:"Best SEO tips", isKeyword:false}]` |
| HK-02 | `"Best SEO tips"` | `"SEO"` | `[{…"Best ",false},{…"SEO",true},{…" tips",false}]` |
| HK-03 | `"SEO SEO"` | `"SEO"` | two keyword segments |
| HK-04 | Case: `"best seo"` | `"SEO"` | `isKeyword:true` on `"seo"` (case-insensitive) |
| HK-05 | Regex special chars in keyword (`"C++"`) | `"C++"` | escaped correctly, no throw |
| HK-06 | Keyword not in text | `"blockchain"` | single non-keyword segment |
| HK-07 | Empty text | `"SEO"` | `[]` (or single empty-filtered segment) |

#### `formatGoogleBreadcrumb(url)`

| Test ID | Input | `domain` | `breadcrumb` |
|---|---|---|---|
| GB-01 | `""` | `"example.com"` | `""` |
| GB-02 | `"https://example.com"` | `"example.com"` | `""` |
| GB-03 | `"https://www.example.com/blog/post"` | `"example.com"` | `"blog › post"` | www stripped |
| GB-04 | `"https://myblog.com/a/b/c"` | `"myblog.com"` | `"a › b › c"` |
| GB-05 | `"not-a-url"` | `"example.com"` | `""` |

---

### 2.3 `src/lib/history.ts`

File: `src/lib/history.test.ts`

**Mock strategy**: Use `vi.stubGlobal` to replace `localStorage` with an in-memory fake before each test; restore after.

| Test ID | Scenario | Expected |
|---|---|---|
| HI-01 | `readHistory()` when localStorage empty | `[]` |
| HI-02 | `readHistory()` with corrupt JSON | `[]` (graceful) |
| HI-03 | `readHistory()` with non-array JSON | `[]` |
| HI-04 | `saveHistoryEntry(entry)` — first entry | returns entry with `id` and `timestamp` |
| HI-05 | `saveHistoryEntry` — 20 entries then one more | oldest dropped, length === 20 | AC: F010-1 |
| HI-06 | `saveHistoryEntry` — duplicate (same title+desc+url) | old duplicate removed, new entry at front | dedup |
| HI-07 | `deleteHistoryEntry(id)` — existing id | entry removed from list |
| HI-08 | `deleteHistoryEntry(id)` — non-existent id | list unchanged |
| HI-09 | `clearHistory()` | `readHistory()` returns `[]` |
| HI-10 | `saveHistoryEntry` when localStorage throws | returns `null` (graceful) | AC: F010-4 |
| HI-11 | `readHistory()` when localStorage throws | `[]` (graceful) | AC: F010-4 |

#### `formatHistoryDate(timestamp)`

| Test ID | Input | Expected |
|---|---|---|
| FD-01 | `Date.now()` | `"Just now"` |
| FD-02 | 30 minutes ago | `"30m ago"` |
| FD-03 | 2 hours ago | `"2h ago"` |
| FD-04 | 3 days ago | `"3d ago"` |
| FD-05 | 10 days ago | locale date string (e.g. `"Mar 9"`) |

---

### 2.4 `src/lib/embed.ts`

File: `src/lib/embed.test.ts`

#### `generateEmbedCode(options)`

| Test ID | Options | Expected snippet contains |
|---|---|---|
| GE-01 | `{}` (defaults) | `src="…/embed"`, `width="100%"`, `height="700"` | AC: F008-1 |
| GE-02 | `{ compactMode: true }` | `?compact=true`, `height="450"` |
| GE-03 | `{ showScores: false }` | `?showScores=false` |
| GE-04 | `{ showPreviews: false }` | `?showPreviews=false` |
| GE-05 | `{ defaultTitle: "My Title" }` | `title=My+Title` (URL-encoded) |
| GE-06 | `{ defaultTitle: "Hello World" }` | title param present |
| GE-07 | defaults with no options set to false | no `showScores=false` or `showPreviews=false` in URL |
| GE-08 | Always | `title="SEO Meta Preview & Scorer"`, `loading="lazy"` |
| GE-09 | Always | `min-width: 320px`, `max-width: 100%` in style | AC: F008-4 |
| GE-10 | "Powered by" link | widget page includes `Powered by` attribution | AC: F008-3 |

#### `parseWidgetOptions(searchParams)`

| Test ID | Params | Expected |
|---|---|---|
| PW-01 | `showScores=false` | `{ showScores: false }` |
| PW-02 | `showPreviews=false` | `{ showPreviews: false }` |
| PW-03 | `compact=true` | `{ compactMode: true }` |
| PW-04 | `title=My+Title&url=https://example.com` | `{ defaultTitle: "My Title", defaultUrl: "https://example.com" }` |
| PW-05 | empty params | `{}` |
| PW-06 | `showScores=true` (explicit true) | `showScores` NOT set in result (only `false` triggers) |

**Roundtrip test**: `parseWidgetOptions(new URLSearchParams(queryStringFrom(generateEmbedCode(opts))))` reproduces `opts` (covered in §5).

---

### 2.5 `src/lib/bulk.ts`

File: `src/lib/bulk.test.ts`

#### `parseCsv(csvText)`

| Test ID | Input | Expected |
|---|---|---|
| PC-01 | CSV with `title,description,url` header + 1 data row | 1 `BulkInputRow` |
| PC-02 | Missing `title` column | `[]` |
| PC-03 | Header only, no data rows | `[]` |
| PC-04 | Empty string | `[]` |
| PC-05 | Quoted fields with commas | field correctly parsed |
| PC-06 | Quoted fields with escaped double quotes (`""`) | `"` decoded correctly |
| PC-07 | CRLF line endings | parsed correctly |
| PC-08 | `keyword` column present | `keyword` populated |
| PC-09 | `keyword` column absent | `keyword: undefined` |
| PC-10 | Blank data rows skipped | filtered out |

#### `processBulkRows(rows)`

| Test ID | Input | Expected |
|---|---|---|
| PR-01 | 1 row with perfect metadata | `overallScore === 100` |
| PR-02 | 501 rows | only 500 processed (slice) | AC: F011-2 |
| PR-03 | 0 rows | `[]` |

#### `exportResultsToCsv(results)`

| Test ID | Scenario | Expected |
|---|---|---|
| EC-01 | Headers present | first row = `Title,Description,URL,...` |
| EC-02 | Field with comma | wrapped in double quotes |
| EC-03 | Field with double quote | `""` escaped |
| EC-04 | `overallScore` column present | AC: F011-3 |

#### `downloadCsv(content, filename)`

**Mock strategy**: `vi.spyOn(document, 'createElement')` and `URL.createObjectURL`.

| Test ID | Expected |
|---|---|
| DC-01 | Creates `<a>` element with `download` attr |
| DC-02 | `URL.createObjectURL` called with Blob |
| DC-03 | `URL.revokeObjectURL` called (no memory leak) |

---

### 2.6 `src/lib/screenshot.ts`

File: `src/lib/screenshot.test.ts`

**Mock strategy**: `vi.mock('html2canvas')` returning a fake canvas with `toBlob` and `getContext`.

| Test ID | Scenario | Expected |
|---|---|---|
| SS-01 | Successful capture | returns `{ success: true }` | AC: F007-1 |
| SS-02 | `toBlob` returns `null` | returns `{ success: false, error: "…" }` |
| SS-03 | `html2canvas` throws | returns `{ success: false, error: "…" }` |
| SS-04 | Watermark drawn | `ctx.fillText` called with text containing `"Generated by SEO Meta Preview"` | AC: F007-3 |
| SS-05 | Watermark positioned at canvas bottom | `fillRect` y offset = `canvas.height - watermarkHeight` |
| SS-06 | Default format is `"png"` | mime type `image/png` |
| SS-07 | `format: "jpg"` | mime type `image/jpeg`, quality passed |
| SS-08 | `scale` option passed to html2canvas | `scale: options.scale ?? 2` |
| SS-09 | Download `<a>` element triggered and removed | `click()` called, `removeChild` called |

---

### 2.7 `src/lib/utils.ts`

File: (add to existing test or create `src/lib/utils.test.ts`)

| Test ID | Function | Scenario |
|---|---|---|
| UT-01 | `cn(...)` | merges Tailwind classes, handles falsy values |
| UT-02 | `truncate(str, n)` | strings ≤ n unchanged; > n appends `…` |
| UT-03 | `copyToClipboard(text)` | calls `navigator.clipboard.writeText` |
| UT-04 | `debounce(fn, ms)` | function called only once after delay |
| UT-05 | `generateId()` | returns non-empty string |
| UT-06 | `isBrowser()` | returns `true` in jsdom, would return `false` in Node |
| UT-07 | `delay(ms)` | resolves after ~ms |

---

### 2.8 `src/lib/hooks/useMetaInput.ts`

File: Tested via `renderHook` in Vitest + RTL.

| Test ID | Scenario | Expected |
|---|---|---|
| UM-01 | Default state uses `EXAMPLES` constants | `metadata.title === EXAMPLES.title` |
| UM-02 | `setMetadata` updates all derived scores | `titleScore`, `descriptionScore`, `overall` re-computed |
| UM-03 | Invalid URL updates `urlValidation.valid = false` | AC: F001-3 |
| UM-04 | Title > 50 chars → `mobileTruncation.titleTruncated = true` | AC: F004-4 |
| UM-05 | Description > 120 chars → `mobileTruncation.descriptionTruncated = true` | AC: F004-4 |
| UM-06 | Both within limits → `mobileTruncation.hasIssues = false` | |
| UM-07 | `initial` prop overrides defaults | title from initial used |

---

### 2.9 `src/lib/hooks/useTheme.ts`

File: Tested via `renderHook`.

| Test ID | Scenario | Expected |
|---|---|---|
| UT-01 | No stored theme, system = light → initial theme `"light"` | AC: F009-1 |
| UT-02 | No stored theme, system = dark → initial theme `"dark"` | AC: F009-1 |
| UT-03 | Stored theme `"dark"` in localStorage → initial `"dark"` | AC: F009-4 |
| UT-04 | `toggleTheme()` from light → `"dark"`, `"dark"` class on `<html>` | AC: F009-2 |
| UT-05 | `toggleTheme()` persists to `localStorage` | AC: F009-4 |
| UT-06 | `localStorage` throws on `setItem` → no crash | graceful degradation |

---

### 2.10 `src/lib/hooks/useHistory.ts`

File: Tested via `renderHook` with mocked localStorage.

| Test ID | Scenario | Expected |
|---|---|---|
| UH-01 | Mount: reads existing history | state populated |
| UH-02 | `save()` calls `saveHistoryEntry` | new entry in state |
| UH-03 | `remove(id)` removes entry from state | |
| UH-04 | `clear()` empties state | AC: F010-3 |
| UH-05 | localStorage unavailable → state `[]` | AC: F010-4 |

---

### 2.11 API Route: `GET /api/fetch-meta/route.ts`

File: `src/app/api/fetch-meta/route.test.ts`

**Mock strategy**: `vi.mock('node-fetch')` or `vi.spyOn(globalThis, 'fetch')` to return controlled HTML.

| Test ID | Request | Expected response |
|---|---|---|
| FM-01 | No `url` param | `400 { error: "URL parameter is required" }` | AC: F012-3 |
| FM-02 | `url=not-a-url` | `400 { error: "Invalid URL format" }` | AC: F012-3 |
| FM-03 | `url=ftp://example.com` | `400 { error: "Only http/https…" }` |
| FM-04 | Valid URL → upstream returns 404 | `502 { error: "Failed to fetch URL: HTTP 404" }` | AC: F012-3 |
| FM-05 | Valid URL → upstream returns `Content-Type: application/pdf` | `400 { error: "URL does not return an HTML page" }` |
| FM-06 | Valid URL → HTML with `<title>My Title</title>` | `200 { title: "My Title", … }` | AC: F012-1 |
| FM-07 | HTML with meta description | `description` populated |
| FM-08 | HTML with `og:title`, `og:description`, `og:image` | OG fields populated | AC: F012-1 |
| FM-09 | HTML entities in title (`&amp;`, `&lt;`) | decoded in response |
| FM-10 | `attribute-before-content` meta tag order | regex alternate branch matches |
| FM-11 | `AbortController` fires (timeout simulation) | `504 { error: "Request timed out…" }` | AC: F012-3 |
| FM-12 | `fetch` throws non-abort error | `502 { error: "Failed to fetch URL…" }` | AC: F012-3 |

---

### 2.12 API Route: `GET /api/og/route.tsx`

File: `src/app/api/og/route.test.ts`

**Mock strategy**: Mock `ImageResponse` to return a fixed response object; verify the JSX structure passed to it.

| Test ID | Params | Expected |
|---|---|---|
| OG-01 | No params | title defaults to `"SEO Meta Preview & Scorer"` |
| OG-02 | `?title=Hello` | title `"Hello"` passed to ImageResponse |
| OG-03 | `?score=85` | score `"85"` rendered; color `#22c55e` (green ≥ 80) |
| OG-04 | `?score=60` | color `#eab308` (yellow 50-79) |
| OG-05 | `?score=30` | color `#ef4444` (red < 50) |
| OG-06 | `?score=85` | description block NOT rendered (score branch) |
| OG-07 | No `score` param | description block rendered |
| OG-08 | Response dimensions | `width: 1200, height: 630` |

---

## 3. Integration Tests

These test the full HTTP request/response cycle using Next.js test utilities or a test server. They complement the unit tests by verifying real HTTP behavior, headers, and status codes.

### 3.1 `GET /api/fetch-meta`

File: `e2e/api-fetch-meta.spec.ts` (Playwright API testing) or `src/app/api/fetch-meta/route.integration.test.ts`

| Test ID | Scenario | Request | Expected |
|---|---|---|---|
| IFM-01 | Missing URL param | `GET /api/fetch-meta` | `400`, JSON body with `error` |
| IFM-02 | Malformed URL | `GET /api/fetch-meta?url=foo` | `400` |
| IFM-03 | Non-HTTP protocol | `GET /api/fetch-meta?url=ftp://x.com` | `400` |
| IFM-04 | Valid HTML page (mocked upstream) | `GET /api/fetch-meta?url=https://example.com` | `200` with `title`, `description`, `ogTitle`, `ogImage`, `url` fields |
| IFM-05 | Upstream timeout | — | `504` within 10 seconds |
| IFM-06 | Non-HTML content type | — | `400` |
| IFM-07 | Upstream HTTP error (e.g. 500) | — | `502` |
| **Auth** | No auth required | All requests | No `401` or `403` |
| **CORS** | Request from foreign origin | — | No CORS header needed (server-side proxy) |

### 3.2 `GET /api/og`

File: `src/app/api/og/route.integration.test.ts`

| Test ID | Scenario | Request | Expected |
|---|---|---|---|
| IOG-01 | Default params | `GET /api/og` | `200`, `Content-Type: image/png` |
| IOG-02 | With title and score | `GET /api/og?title=Hello&score=90` | `200`, image |
| IOG-03 | Image dimensions | Response dimensions | 1200×630 |
| **Auth** | No auth required | All requests | No `401` |
| **Runtime** | Edge runtime declared | `export const runtime = "edge"` | Correct |

### 3.3 `GET /embed` (Page Route)

| Test ID | Scenario | Request | Expected |
|---|---|---|---|
| IE-01 | Default render | `GET /embed` | `200`, full HTML |
| IE-02 | With `compact=true` | `GET /embed?compact=true` | compactMode in rendered HTML |
| IE-03 | With pre-filled title | `GET /embed?title=My+Page` | title pre-populated in widget |
| IE-04 | Frame headers | `GET /embed` response headers | `X-Frame-Options` NOT `DENY` (embeddable) | AC: Security checklist |
| IE-05 | Main page frame headers | `GET /` response headers | `X-Frame-Options: DENY` | AC: Security |

### 3.4 Error Scenarios (All Routes)

| Test ID | Scenario | Expected |
|---|---|---|
| ERR-01 | `/api/fetch-meta` — URL with `javascript:` scheme | `400` or validation error |
| ERR-02 | All JSON error responses | include `"error"` key, never stack traces |
| ERR-03 | Extra unexpected query params | ignored gracefully (no `500`) |

---

## 4. E2E Tests

All E2E tests use **Playwright**. Files live in `e2e/`.

### Page Objects

```typescript
// e2e/pages/MainPage.ts
class MainPage {
  // Locators
  titleInput       = page.getByTestId('input-title')
  descInput        = page.getByTestId('input-description')
  urlInput         = page.getByTestId('input-url')
  keywordInput     = page.getByTestId('input-keyword')
  titleCounter     = page.getByTestId('counter-title')
  descCounter      = page.getByTestId('counter-description')
  urlError         = page.getByTestId('error-url')
  themeToggle      = page.getByTestId('theme-toggle')

  // Preview tabs
  tabGoogle        = page.getByTestId('tab-google-desktop')
  tabMobile        = page.getByTestId('tab-google-mobile')
  tabBing          = page.getByTestId('tab-bing')
  tabSocial        = page.getByTestId('tab-social')

  // Preview containers
  googlePreview    = page.getByTestId('preview-google-desktop')
  mobilePreview    = page.getByTestId('preview-google-mobile')
  bingPreview      = page.getByTestId('preview-bing')
  socialPreview    = page.getByTestId('preview-social')

  // Score dashboard
  titleScoreBadge  = page.getByTestId('score-title')
  descScoreBadge   = page.getByTestId('score-description')
  kwScoreBadge     = page.getByTestId('score-keyword')
  overallGauge     = page.getByTestId('score-overall')
  mobileTruncWarn  = page.getByTestId('warning-mobile-truncation')

  // Screenshot
  screenshotBtn    = page.getByTestId('btn-screenshot')

  // History
  historyPanel     = page.getByTestId('panel-history')
  historyToggle    = page.getByTestId('btn-history-toggle')
}
```

### Required `data-testid` Attributes

The following `data-testid` values must be present in the DOM for E2E tests to function:

| Component | `data-testid` |
|---|---|
| `MetaInputForm` → title `<input>` | `input-title` |
| `MetaInputForm` → description `<textarea>` | `input-description` |
| `MetaInputForm` → URL `<input>` | `input-url` |
| `MetaInputForm` → keyword `<input>` | `input-keyword` |
| `CharacterCounter` for title | `counter-title` |
| `CharacterCounter` for description | `counter-description` |
| URL validation error message | `error-url` |
| `GoogleDesktopPreview` wrapper | `preview-google-desktop` |
| `GoogleMobilePreview` wrapper | `preview-google-mobile` |
| `BingPreview` wrapper | `preview-bing` |
| `SocialCardPreview` wrapper | `preview-social` |
| Preview tab triggers | `tab-google-desktop`, `tab-google-mobile`, `tab-bing`, `tab-social` |
| `ScoreCard` for title | `score-title` |
| `ScoreCard` for description | `score-description` |
| `ScoreCard` for keyword | `score-keyword` |
| `OverallScoreGauge` | `score-overall` |
| `MobileTruncationWarning` | `warning-mobile-truncation` |
| `ScreenshotButton` | `btn-screenshot` |
| `ThemeToggle` | `theme-toggle` |
| `HistoryPanel` | `panel-history` |
| History toggle button | `btn-history-toggle` |
| `EmbedCodeGenerator` textarea/pre | `embed-code-output` |
| URL fetch button | `btn-fetch-url` |
| URL fetch spinner | `spinner-fetch` |

---

### 4.1 F001: Meta Input Form

File: `e2e/input-form.spec.ts`

**E2E-F001-01: Character counter updates in real time**
```
1. Navigate to /
2. Click title input
3. Type "Hello World" (11 chars)
4. Assert counter shows "11"
5. Clear and type a 60-char title
6. Assert counter shows "60"
```
Covers: F001 AC-1

**E2E-F001-02: Description character counter**
```
1. Navigate to /
2. Type 155-char description into description textarea
3. Assert description counter shows "155"
```
Covers: F001 AC-2

**E2E-F001-03: URL validation error**
```
1. Navigate to /
2. Type "not-a-url" into URL input
3. Blur the field (Tab away)
4. Assert error-url element is visible with error text
```
Covers: F001 AC-3

**E2E-F001-04: Placeholder values shown on empty form**
```
1. Navigate to /
2. Assert all input fields have placeholder attributes or example content
3. Assert google-desktop preview is visible with example title
```
Covers: F001 AC-4

**E2E-F001-05: All previews update on input (latency check)**
```
1. Navigate to /
2. Start performance trace
3. Type single character in title input
4. Assert google preview title text updated
5. Assert bing preview title text updated
6. Assert score badge updated
(16ms latency validated via performance API: no measurable debounce delay)
```
Covers: F001 AC-5

---

### 4.2 F002: Google SERP Preview (Desktop)

File: `e2e/previews.spec.ts`

**E2E-F002-01: Title renders as blue link**
```
1. Fill title: "Best SEO Tips for 2024"
2. Assert preview-google-desktop contains element with text "Best SEO Tips for 2024"
3. Assert element has correct color class or blue styling
```
Covers: F002 AC-1

**E2E-F002-02: URL renders as green breadcrumb**
```
1. Fill URL: "https://myblog.com/seo/guide"
2. Assert google desktop preview contains "myblog.com › seo › guide" in green
```
Covers: F002 AC-2

**E2E-F002-03: Title truncation at 60 chars**
```
1. Fill title with 80-char string
2. Assert google desktop preview title ends with "…" (ellipsis)
3. Assert truncated title length ≤ 61 chars (60 + ellipsis)
```
Covers: F002 AC-3

**E2E-F002-04: Description truncation at 160 chars**
```
1. Fill description with 200-char string
2. Assert google desktop preview description ends with "…"
```
Covers: F002 AC-4

**E2E-F002-05: Keyword bolded in preview**
```
1. Fill title: "Best SEO Tips for 2024", keyword: "SEO"
2. Assert google desktop preview contains <strong> or bold element with "SEO"
```
Covers: F002 AC-5

---

### 4.3 F003: Google SERP Preview (Mobile)

File: `e2e/previews.spec.ts` (continued)

**E2E-F003-01: Mobile title truncates at ~50 chars**
```
1. Fill title with 70-char string
2. Click tab-google-mobile
3. Assert mobile preview title ends with "…"
4. Assert truncated title is shorter than desktop truncated title
```
Covers: F003 AC-1

**E2E-F003-02: Mobile description truncates at ~120 chars**
```
1. Fill description with 200-char string
2. Click tab-google-mobile
3. Assert mobile preview description ends with "…" before desktop equivalent
```
Covers: F003 AC-2

**E2E-F003-03: Mobile container width 360px**
```
1. Click tab-google-mobile
2. Assert preview-google-mobile container has max-width / width of 360px
```
Covers: F003 AC-3

---

### 4.4 F004: SEO Score Dashboard

File: `e2e/scoring.spec.ts`

**E2E-F004-01: Title score colors**
```
1. Fill title with 45-char string → assert score-title badge is green
2. Fill title with 65-char string → assert score-title badge is yellow
3. Fill title with 80-char string → assert score-title badge is red
```
Covers: F004 AC-1

**E2E-F004-02: Description score colors**
```
1. Fill description with 140-char string → assert score-description badge is green
2. Fill description with 175-char string → assert score-description badge is yellow
3. Fill description with 210-char string → assert score-description badge is red
```
Covers: F004 AC-2

**E2E-F004-03: Keyword presence feedback**
```
1. Fill title: "Best SEO Tips", description: "Learn SEO today", keyword: "SEO"
2. Assert score-keyword shows green / "found in both"
3. Clear description keyword, fill description without "SEO"
4. Assert keyword score shows "found in title" message
```
Covers: F004 AC-3

**E2E-F004-04: Mobile truncation warning**
```
1. Fill title with 55-char string
2. Assert warning-mobile-truncation is visible
3. Shorten title to 45 chars
4. Assert warning-mobile-truncation is not visible (or hidden)
```
Covers: F004 AC-4

**E2E-F004-05: Overall score as weighted average**
```
1. Fill title with 45-char "Best SEO Guide", description with 150-char text, keyword "SEO"
2. Read score-overall displayed value
3. Assert it is between 0 and 100
4. Assert overall score text equals Math.round(titleS*0.4 + descS*0.4 + kwS*0.2)
```
Covers: F004 AC-5

---

### 4.5 F005: Bing SERP Preview

File: `e2e/previews.spec.ts` (continued)

**E2E-F005-01: Bing styling differs from Google**
```
1. Fill title, description, URL
2. Assert preview-bing is visible
3. Assert Bing preview title color is NOT the Google blue (#1a0dab) — visually different
```
Covers: F005 AC-1

**E2E-F005-02: Bing title truncation at 65 chars**
```
1. Fill title with 70-char string
2. Assert bing preview title ends with "…"
3. Assert google desktop truncates same title (at 60) earlier than Bing
```
Covers: F005 AC-2

---

### 4.6 F006: Social/OG Card Preview

File: `e2e/previews.spec.ts` (continued)

**E2E-F006-01: Social card renders with fallback to regular title/description**
```
1. Fill title: "My Page", description: "My page description"
2. Click tab-social
3. Assert preview-social contains "My Page"
4. Assert preview-social contains "My page description"
```
Covers: F006 AC-1

**E2E-F006-02: No OG image shows placeholder**
```
1. Navigate to / with no OG image field filled
2. Click tab-social
3. Assert social preview shows "1200×630" placeholder text or "Add OG Image URL" prompt
```
Covers: F006 AC-2

**E2E-F006-03: OG image URL loads image**
```
1. Fill OG image URL with a valid image URL
2. Assert social card preview shows an <img> element with that src
```
Covers: F006 AC-3

---

### 4.7 F007: Screenshot Export

File: `e2e/screenshot.spec.ts`

**E2E-F007-01: Download triggered on button click**
```
1. Fill title and description
2. Listen for download event (Playwright download fixture)
3. Click btn-screenshot
4. Assert download starts within 2 seconds
5. Assert downloaded filename matches "seo-preview-*.png"
```
Covers: F007 AC-1, F007 AC-4

**E2E-F007-02: Loading spinner during generation**
```
1. Click btn-screenshot
2. Assert loading spinner appears immediately (before download completes)
3. Assert spinner disappears after download
```
Covers: F007 AC-4

---

### 4.8 F008: Embeddable Widget

File: `e2e/embed.spec.ts`

**E2E-F008-01: Embed code shown on /widget page**
```
1. Navigate to /widget
2. Assert embed-code-output contains "<iframe"
3. Assert embed code contains "https://…/embed"
```
Covers: F008 AC-1

**E2E-F008-02: Widget renders in iframe**
```
1. Navigate to /embed
2. Assert page renders without error
3. Assert MetaInputForm is present in page
```
Covers: F008 AC-2, F008 AC-5

**E2E-F008-03: "Powered by" link present**
```
1. Navigate to /embed
2. Assert page contains "Powered by" text with a link
3. Assert link opens in new tab (target="_blank")
```
Covers: F008 AC-3

**E2E-F008-04: Widget responsive minimum width**
```
1. Navigate to /embed
2. Assert main container has min-width: 320px style
```
Covers: F008 AC-4

**E2E-F008-05: Pre-filled parameters pass through**
```
1. Navigate to /embed?title=My+Page&description=My+desc
2. Assert title input shows "My Page"
3. Assert description input shows "My desc"
```
Covers: F008 AC-2 (widget functionality mirrors main tool)

---

### 4.9 F009: Dark Mode

File: `e2e/theme.spec.ts`

**E2E-F009-01: System dark mode preference honored**
```
1. Launch Playwright with colorScheme: 'dark'
2. Navigate to /
3. Assert <html> element has class "dark"
```
Covers: F009 AC-1

**E2E-F009-02: Theme toggle switches to dark**
```
1. Navigate to / (light mode)
2. Click theme-toggle
3. Assert <html> element has class "dark" within 100ms
```
Covers: F009 AC-2

**E2E-F009-03: SERP previews remain light in dark mode**
```
1. Toggle to dark mode
2. Assert google preview background is white/light (not dark)
3. Assert bing preview background is white/light
```
Covers: F009 AC-3

**E2E-F009-04: Theme persists across page reload**
```
1. Click theme-toggle to switch to dark
2. Reload page
3. Assert <html> still has class "dark"
```
Covers: F009 AC-4

---

### 4.10 F010: History / Recent Checks

File: `e2e/history.spec.ts`

**E2E-F010-01: History entries appear after filling form**
```
1. Navigate to /
2. Fill complete metadata
3. Toggle history panel open
4. Assert history entry with matching title appears
5. Assert timestamp shown
6. Assert overall score shown
```
Covers: F010 AC-1

**E2E-F010-02: Click history entry repopulates form**
```
1. Complete a check (save to history)
2. Clear the form
3. Click history entry
4. Assert form fields repopulated with saved values
```
Covers: F010 AC-2

**E2E-F010-03: History uses localStorage only**
```
1. Perform check
2. Hard reload page (clears JS state)
3. Assert history entry still present
4. Assert no network request for history data
```
Covers: F010 AC-3

**E2E-F010-04: Graceful degradation without localStorage**
```
1. Block localStorage access via page.addInitScript
2. Navigate to /
3. Assert tool loads without error
4. Assert history panel either hidden or shows empty state
```
Covers: F010 AC-4

---

### 4.11 F011: Bulk CSV Check

File: `e2e/bulk.spec.ts`

**E2E-F011-01: CSV upload and scoring table**
```
1. Navigate to / (bulk check section)
2. Upload CSV file with "title,description,url" columns and 3 rows
3. Assert results table shows 3 rows with scores
```
Covers: F011 AC-1

**E2E-F011-02: 500 rows processed within 5 seconds**
```
1. Generate CSV with 500 rows
2. Upload file; start timer
3. Assert results table renders within 5000ms
```
Covers: F011 AC-2

**E2E-F011-03: Export results CSV**
```
1. Upload and process CSV
2. Listen for download
3. Click "Export Results"
4. Assert CSV file downloaded with score columns
```
Covers: F011 AC-3

---

### 4.12 F012: URL Fetch

File: `e2e/url-fetch.spec.ts`

**E2E-F012-01: Fetch URL auto-populates form**
```
1. Intercept /api/fetch-meta with mock response returning title/description
2. Fill URL fetch field with https://example.com
3. Click btn-fetch-url
4. Assert title input populated with mocked title
5. Assert description input populated with mocked description
```
Covers: F012 AC-1

**E2E-F012-02: Loading spinner during fetch**
```
1. Intercept /api/fetch-meta with 500ms delayed response
2. Click btn-fetch-url
3. Assert spinner-fetch visible immediately
4. Await response
5. Assert spinner-fetch hidden
```
Covers: F012 AC-2

**E2E-F012-03: Error state on fetch failure**
```
1. Intercept /api/fetch-meta with error response
2. Click btn-fetch-url
3. Assert error message visible suggesting manual entry
```
Covers: F012 AC-3

---

### 4.13 Accessibility

File: `e2e/accessibility.spec.ts`

**E2E-A11Y-01: Zero axe violations on home page**
```
1. Navigate to /
2. Run axe-core via @axe-core/playwright
3. Assert violations.length === 0
```
Covers: NFR Accessibility — WCAG 2.2 AA

**E2E-A11Y-02: Zero axe violations on /embed**
```
1. Navigate to /embed
2. Run axe-core
3. Assert violations.length === 0
```

**E2E-A11Y-03: Full keyboard navigation**
```
1. Navigate to /
2. Press Tab repeatedly
3. Assert every interactive element receives visible focus ring
4. Assert all four preview tabs reachable by keyboard
5. Assert screenshot button reachable
6. Assert theme toggle reachable
```
Covers: NFR — Full keyboard navigation

---

### 4.14 Performance / Non-Functional

File: `e2e/performance.spec.ts`

**E2E-PERF-01: First Contentful Paint < 1500ms (throttled)**
```
1. Launch with network: 'Slow3G' via devtools
2. Navigate to /
3. Assert FCP from PerformanceObserver < 1500ms
```
Covers: NFR Performance — FCP

**E2E-PERF-02: Input-to-preview latency < 16ms**
```
1. Navigate to /
2. Record performance entry before and after single keystroke in title
3. Assert React re-render completes within 16ms (single frame)
```
Covers: NFR — 16ms input latency, F001 AC-5

---

## 5. Property-Based Test Candidates

Use `fast-check` via Vitest. File pattern: `*.property.test.ts`.

### PBT-01: `truncateAtChars` — output never exceeds limit

```typescript
// File: src/lib/truncation.property.test.ts
fc.property(fc.string(), fc.integer({ min: 1, max: 200 }), (text, maxChars) => {
  const result = truncateAtChars(text, maxChars);
  // Result content is never longer than maxChars characters (ellipsis is 1 char)
  expect(result.replace('…', '').length).toBeLessThanOrEqual(maxChars);
});
```

### PBT-02: `truncateAtChars` — input ≤ limit is returned unchanged

```typescript
fc.property(fc.string({ maxLength: 60 }), (text) => {
  expect(truncateAtChars(text, 60)).toBe(text);
});
```

### PBT-03: `calculateOverallScore` — output always in [0, 100]

```typescript
fc.property(
  fc.integer({ min: 0, max: 100 }),
  fc.integer({ min: 0, max: 100 }),
  fc.integer({ min: 0, max: 100 }),
  (t, d, k) => {
    const score = calculateOverallScore(t, d, k);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(Number.isInteger(score)).toBe(true);
  }
);
```

### PBT-04: `scoreTitle` / `scoreDescription` — score always in [0, 100]

```typescript
fc.property(fc.string(), (title) => {
  const { score } = scoreTitle(title);
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(100);
});
```

### PBT-05: `generateEmbedCode` + `parseWidgetOptions` roundtrip

```typescript
fc.property(
  fc.record({
    showScores: fc.option(fc.constant(false)),
    showPreviews: fc.option(fc.constant(false)),
    compactMode: fc.option(fc.constant(true)),
    defaultTitle: fc.option(fc.string({ maxLength: 100 })),
  }),
  (opts) => {
    const code = generateEmbedCode(opts);
    const srcMatch = code.match(/src="([^"]+)"/);
    const src = srcMatch?.[1] ?? '';
    const url = new URL(src);
    const parsed = parseWidgetOptions(url.searchParams);
    // Options that were explicitly set should roundtrip
    if (opts.showScores === false) expect(parsed.showScores).toBe(false);
    if (opts.showPreviews === false) expect(parsed.showPreviews).toBe(false);
    if (opts.compactMode === true) expect(parsed.compactMode).toBe(true);
  }
);
```

### PBT-06: `parseCsv` — never throws on arbitrary string input

```typescript
fc.property(fc.string(), (csv) => {
  expect(() => parseCsv(csv)).not.toThrow();
});
```

### PBT-07: `exportResultsToCsv` — output is valid CSV (row count matches)

```typescript
fc.property(fc.array(fc.record({ title: fc.string(), description: fc.string(), url: fc.string() }), { maxLength: 20 }), (rows) => {
  const results = processBulkRows(rows);
  const csv = exportResultsToCsv(results);
  const lines = csv.split('\n');
  expect(lines.length).toBe(results.length + 1); // +1 for header
});
```

### PBT-08: `validateUrl` — accepts all valid http/https URLs constructed by `new URL()`

```typescript
fc.property(fc.webUrl(), (url) => {
  // fast-check webUrl() always produces valid URLs
  expect(validateUrl(url).valid).toBe(true);
});
```

### PBT-09: `formatGoogleBreadcrumb` — never throws on arbitrary string

```typescript
fc.property(fc.string(), (url) => {
  expect(() => formatGoogleBreadcrumb(url)).not.toThrow();
});
```

### PBT-10: `highlightKeyword` — segments reconstruct original text

```typescript
fc.property(fc.string(), fc.string({ maxLength: 20 }), (text, keyword) => {
  const segments = highlightKeyword(text, keyword);
  const reconstructed = segments.map(s => s.text).join('');
  expect(reconstructed).toBe(text);
});
```

---

## 6. Per-Module Coverage Targets

| Module | Target | Rationale |
|---|---|---|
| `src/lib/scoring.ts` | **100%** | Pure functions, critical business logic, every branch maps to AC |
| `src/lib/truncation.ts` | **100%** | Pure functions, all SERP platforms covered, ACs are exact char boundaries |
| `src/lib/history.ts` | **95%** | localStorage error paths partially untestable; graceful-degradation branches covered |
| `src/lib/embed.ts` | **100%** | Pure functions, simple branching |
| `src/lib/bulk.ts` | **95%** | `downloadCsv` requires browser DOM; tested via mocks |
| `src/lib/screenshot.ts` | **85%** | `html2canvas` is mocked; watermark drawing logic fully covered |
| `src/lib/utils.ts` | **90%** | `isBrowser()` SSR branch only exercisable in non-jsdom env |
| `src/lib/hooks/useMetaInput.ts` | **90%** | All derived state paths; initial override path |
| `src/lib/hooks/useScores.ts` | **90%** | Thin `useMemo` wrapper; covered by `useMetaInput` tests |
| `src/lib/hooks/useTheme.ts` | **90%** | localStorage failure path; SSR guard (`typeof window`) |
| `src/lib/hooks/useHistory.ts` | **90%** | Covered by hook + localStorage mocks |
| `src/app/api/og/route.tsx` | **90%** | Score color branches + description/score toggle |
| `src/app/api/fetch-meta/route.ts` | **95%** | All error branches; HTML entity decoding; both meta attribute orders |
| `src/components/input/MetaInputForm.tsx` | **90%** | Render, input events, counter display, URL error state |
| `src/components/input/CharacterCounter.tsx` | **95%** | Color thresholds for each counter variant |
| `src/components/preview/GoogleDesktopPreview.tsx` | **90%** | Title/desc render, truncation, keyword bolding, breadcrumb |
| `src/components/preview/GoogleMobilePreview.tsx` | **90%** | Mobile-specific limits, container width |
| `src/components/preview/BingPreview.tsx` | **90%** | Bing-specific styling and truncation |
| `src/components/preview/SocialCardPreview.tsx` | **90%** | OG fallback, image placeholder, image load |
| `src/components/scoring/ScoreDashboard.tsx` | **90%** | Color variants, mobile warning visibility |
| `src/components/scoring/OverallScoreGauge.tsx` | **90%** | Gauge value range, color coding |
| `src/components/scoring/ScoreCard.tsx` | **90%** | All three status color variants |
| `src/components/export/ScreenshotButton.tsx` | **85%** | Click handler, loading state, error state |
| `src/components/embed/EmbedCodeGenerator.tsx` | **85%** | Code generation, copy to clipboard |
| `src/components/embed/WidgetWrapper.tsx` | **85%** | Compact mode, Powered By link |
| `src/components/history/HistoryPanel.tsx` | **85%** | Entry list, click-to-restore, clear |
| `src/components/bulk/BulkCheckPanel.tsx` | **80%** | Upload, results table, export |

### Overall Project Target

| Layer | Line Coverage | Branch Coverage |
|---|---|---|
| `src/lib/**` | **≥ 95%** | **≥ 90%** |
| `src/components/**` | **≥ 85%** | **≥ 80%** |
| `src/app/api/**` | **≥ 90%** | **≥ 85%** |
| **Combined** | **≥ 90%** | **≥ 85%** |

---

## 7. Acceptance Criteria Traceability Matrix

Every acceptance criterion from SPEC.md §3 maps to at least one test ID below.

| Feature | Acceptance Criterion | Test IDs |
|---|---|---|
| **F001** | Title char count updates in real-time | E2E-F001-01, UM-02 |
| **F001** | Description char count updates in real-time | E2E-F001-02, UM-02 |
| **F001** | Invalid URL shows error | VU-04, VU-05, UM-03, E2E-F001-03 |
| **F001** | Empty fields show placeholder values | E2E-F001-04, UM-01 |
| **F001** | Input-to-preview latency < 16ms | E2E-F001-05, E2E-PERF-02 |
| **F002** | Title as blue link in Google font 20px | E2E-F002-01 |
| **F002** | URL as green breadcrumb | GB-01–05, E2E-F002-02 |
| **F002** | Title > 60 chars truncates with ellipsis | TA-03, TA-04, E2E-F002-03 |
| **F002** | Description > 160 chars truncates | truncateGoogleDesktopDescription tests, E2E-F002-04 |
| **F002** | Keyword bolded in preview | HK-02–04, E2E-F002-05 |
| **F003** | Mobile title truncates at ~50 chars | truncateGoogleMobileTitle tests, E2E-F003-01 |
| **F003** | Mobile description truncates at ~120 chars | truncateGoogleMobileDescription tests, E2E-F003-02 |
| **F003** | Mobile-width container 360px | E2E-F003-03 |
| **F003** | Font sizes match Google mobile SERP | E2E-F003-03 (computed style check) |
| **F004** | Title score green/yellow/red with feedback | ST-04–11, E2E-F004-01 |
| **F004** | Description score green/yellow/red | SD-04–09, E2E-F004-02 |
| **F004** | Keyword presence in title/desc/both/neither | SK-01–10, E2E-F004-03 |
| **F004** | Mobile truncation warning | CM-01–05, UM-04–06, E2E-F004-04 |
| **F004** | Overall score weighted 40/40/20 shown 0-100 | CO-01–06, PBT-03, E2E-F004-05 |
| **F005** | Bing styling differs from Google | E2E-F005-01 |
| **F005** | Bing title truncates at 65 chars | truncateBingTitle tests, E2E-F005-02 |
| **F005** | Bing description truncates at ~160 chars | truncateBingDescription tests |
| **F006** | Social card with OG or fallback to title/desc | E2E-F006-01 |
| **F006** | No OG image shows placeholder | E2E-F006-02 |
| **F006** | Valid OG image URL loads in preview | E2E-F006-03 |
| **F006** | Facebook/LinkedIn card format | E2E-F006-01 (layout assertions) |
| **F007** | Click Download → PNG downloaded | SS-01, E2E-F007-01 |
| **F007** | Image contains only preview area | E2E-F007-01 (download target element) |
| **F007** | Watermark at bottom | SS-04, SS-05, E2E-F007-01 |
| **F007** | Loading spinner, completes < 2s | E2E-F007-02 |
| **F008** | "Get Embed Code" shows copyable snippet | GE-01–09, E2E-F008-01 |
| **F008** | Embed code renders compact tool in iframe | E2E-F008-02 |
| **F008** | "Powered by" link opens new tab | GE-10, E2E-F008-03 |
| **F008** | Responsive min-width 320px / max 100% | GE-09, E2E-F008-04 |
| **F008** | Widget interactions identical to main tool | E2E-F008-05 |
| **F009** | System dark mode honored on load | UT-02, E2E-F009-01 |
| **F009** | Toggle light → dark within 100ms | UT-04, E2E-F009-02 |
| **F009** | SERP previews always light in dark mode | E2E-F009-03 |
| **F009** | Theme persisted via localStorage | UT-05, E2E-F009-04 |
| **F010** | Last 20 checks listed with title/score/ts | HI-04, HI-05, E2E-F010-01 |
| **F010** | Click entry repopulates form | E2E-F010-02 |
| **F010** | Uses localStorage only | HI-01–09, E2E-F010-03 |
| **F010** | Graceful degradation without localStorage | HI-10, HI-11, E2E-F010-04 |
| **F011** | CSV columns scored, results in table | PC-01–10, PR-01, E2E-F011-01 |
| **F011** | 500 rows within 5 seconds | PR-02, E2E-F011-02 |
| **F011** | Export results CSV | EC-01–04, DC-01–03, E2E-F011-03 |
| **F012** | URL fetch populates title/desc/OG | FM-06–10, IFM-04, E2E-F012-01 |
| **F012** | Spinner during fetch | E2E-F012-02 |
| **F012** | Error message on CORS/timeout | FM-11, FM-12, IFM-05, E2E-F012-03 |
| **NFR: Performance** | FCP < 1.5s on 3G | E2E-PERF-01 |
| **NFR: Performance** | Input latency < 16ms | E2E-PERF-02 |
| **NFR: Accessibility** | WCAG 2.2 AA | E2E-A11Y-01, E2E-A11Y-02 |
| **NFR: Accessibility** | Full keyboard navigation | E2E-A11Y-03 |
| **NFR: Security** | Main site X-Frame-Options: DENY | IE-05 |
| **NFR: Security** | /embed embeddable (no X-Frame-Options deny) | IE-04 |
| **NFR: Security** | No data transmitted to server | E2E-F010-03 (network assertions) |

---

*Last updated: 2026-03-19*
