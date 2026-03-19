# SEO Meta Preview & Scorer — Test Plan

> **Generated**: 2026-03-19
> **Stack**: Vitest 2 + React Testing Library + Playwright
> **Coverage tool**: `@vitest/coverage-v8`

---

## 1. Test Strategy

### 1.1 Guiding Principles

This is a **100% client-side tool** with two thin API routes. The architecture dictates the strategy:

- **Pure library functions** (`scoring.ts`, `truncation.ts`, `history.ts`, `bulk.ts`, `embed.ts`) are the core of the product — they get the most intensive unit test coverage.
- **React components** render derived state; they are tested with RTL for behaviour, not implementation details.
- **API routes** are Next.js Route Handlers; they are tested via integration tests with a mocked global `fetch`.
- **E2E tests** validate the complete user journeys from SPEC.md — one scenario per acceptance criterion that cannot be verified at a lower level.
- **No database, no authentication, no sessions** → no auth scenario matrix needed.

### 1.2 Test Pyramid Ratios

```
        ┌──────────────────┐
        │    E2E (10%)     │  ~25 scenarios · Playwright
        │                  │  Full user flows, file download, iframe
        ├──────────────────┤
        │Integration (25%) │  ~60 tests · Vitest + RTL + MSW
        │                  │  React components, API route handlers
        ├──────────────────┤
        │   Unit (65%)     │  ~180 tests · Vitest
        │                  │  Pure functions, hooks (jsdom), edge cases
        └──────────────────┘
```

| Layer       | Runner     | Files                                                        | Approx. count |
|-------------|------------|--------------------------------------------------------------|---------------|
| Unit        | Vitest     | `src/lib/**/*.test.ts`                                       | ~180 tests    |
| Integration | Vitest+RTL | `src/components/**/*.test.tsx` + `src/app/api/**/*.test.ts`  | ~60 tests     |
| E2E         | Playwright | `e2e/**/*.spec.ts`                                           | ~25 scenarios |

### 1.3 Test File Inventory

```
src/
├── lib/
│   ├── scoring.test.ts            ✅ exists — extend with missing boundary cases
│   ├── truncation.test.ts         ✅ exists — extend with word-boundary + Unicode
│   ├── history.test.ts            ✅ exists — extend with error paths
│   ├── embed.test.ts              ✅ exists — extend with round-trip
│   ├── bulk.test.ts               ✅ exists — extend with quoted fields + perf
│   ├── screenshot.test.ts         ✅ exists — extend with watermark + error paths
│   └── hooks/
│       ├── useMetaInput.test.ts   🆕 create
│       ├── useScores.test.ts      🆕 create
│       ├── useTheme.test.ts       🆕 create
│       └── useHistory.test.ts     🆕 create
├── components/
│   ├── input/
│   │   ├── MetaInputForm.test.tsx          🆕 create
│   │   └── CharacterCounter.test.tsx       🆕 create
│   ├── preview/
│   │   ├── GoogleDesktopPreview.test.tsx   🆕 create
│   │   ├── GoogleMobilePreview.test.tsx    🆕 create
│   │   ├── BingPreview.test.tsx            🆕 create
│   │   └── SocialCardPreview.test.tsx      🆕 create
│   ├── scoring/
│   │   ├── ScoreDashboard.test.tsx         🆕 create
│   │   ├── ScoreCard.test.tsx              🆕 create
│   │   ├── OverallScoreGauge.test.tsx      🆕 create
│   │   └── MobileTruncationWarning.test.tsx 🆕 create
│   ├── export/
│   │   └── ScreenshotButton.test.tsx       🆕 create
│   ├── history/
│   │   └── HistoryPanel.test.tsx           🆕 create
│   ├── bulk/
│   │   └── BulkCheckPanel.test.tsx         🆕 create
│   └── embed/
│       └── EmbedCodeGenerator.test.tsx     🆕 create
├── app/api/
│   ├── fetch-meta/route.test.ts   🆕 create
│   └── og/route.test.ts           🆕 create
└── test/
    ├── setup.ts                   ✅ exists — add localStorage + matchMedia mocks
    └── fixtures/
        └── meta-samples.ts        ✅ exists — extend (see §9)
e2e/
├── main-flow.spec.ts       🆕 create
├── previews.spec.ts        🆕 create
├── scoring.spec.ts         🆕 create
├── screenshot.spec.ts      🆕 create
├── embed.spec.ts           🆕 create
├── dark-mode.spec.ts       🆕 create
├── history.spec.ts         🆕 create
├── bulk.spec.ts            🆕 create
├── url-fetch.spec.ts       🆕 create
├── accessibility.spec.ts   🆕 create
└── mobile.spec.ts          🆕 create
```

### 1.4 CI Gate

| Stage       | Command                         | Blocks merge? |
|-------------|---------------------------------|---------------|
| Unit + Int. | `vitest run --coverage`         | Yes           |
| E2E         | `playwright test`               | Yes           |
| Type check  | `tsc --noEmit`                  | Yes           |
| Lint        | `eslint . --max-warnings 0`     | Yes           |
| Bundle size | `next build` + size check       | Yes           |

---

## 2. Unit Tests

### 2.1 `src/lib/scoring.ts`

**Mock boundaries**: None — pure functions, no I/O.

#### `scoreTitle(title: string)`

| Test case | Input | Expected `status` | Expected `score` | AC ref |
|-----------|-------|-------------------|------------------|--------|
| Empty string | `""` | `"error"` | `0` | F004-AC1 |
| 1 character | `"A"` | `"error"` | `40` | F004-AC1 |
| Exactly 9 chars (boundary below min) | `"123456789"` | `"error"` | `40` | F004-AC1 |
| Exactly 10 chars (good start) | `"1234567890"` | `"good"` | `100` | F004-AC1 |
| 30 chars (optimal start) | `"A".repeat(30)` | `"good"` | `100` | F004-AC1 |
| 45 chars (mid-optimal) | `"A".repeat(45)` | `"good"` | `100` | F004-AC1 |
| Exactly 60 chars (optimal end) | `"A".repeat(60)` | `"good"` | `100` | F004-AC1 |
| 61 chars (warning start) | `"A".repeat(61)` | `"warning"` | `80` | F004-AC1 |
| Exactly 70 chars (warning end) | `"A".repeat(70)` | `"warning"` | `80` | F004-AC1 |
| 71 chars (error start) | `"A".repeat(71)` | `"error"` | `50` | F004-AC1 |
| 200 chars | `"A".repeat(200)` | `"error"` | `50` | F004-AC1 |
| Whitespace-only | `"   "` | `"good"` (length=3, treated as chars) | — | F004-AC1 |
| Unicode emoji (JS length counts UTF-16) | `"🚀".repeat(5)` (length=10) | `"good"` | `100` | F004-AC1 |
| Message includes actual char count | 65-char title | `message` contains `"65"` | — | F004-AC1 |

**Edge cases beyond existing tests**:
- Title with emoji: `"🚀"` has `.length === 2` (surrogate pair). Document that scoring uses JS `.length`. Test explicitly so future Unicode-aware changes are intentional.
- Very long string (500 chars) — no crash, returns `{score: 50, status: "error"}`.

#### `scoreDescription(description: string)`

| Test case | Input length | Expected `status` | Expected `score` | AC ref |
|-----------|-------------|-------------------|------------------|--------|
| Empty | 0 | `"error"` | `0` | F004-AC2 |
| 1 char | 1 | `"warning"` | `60` | F004-AC2 |
| 119 chars (one below good range) | 119 | `"warning"` | `60` | F004-AC2 |
| Exactly 120 chars (good start) | 120 | `"good"` | `100` | F004-AC2 |
| 140 chars | 140 | `"good"` | `100` | F004-AC2 |
| Exactly 160 chars (good end) | 160 | `"good"` | `100` | F004-AC2 |
| 161 chars (warning start) | 161 | `"warning"` | `80` | F004-AC2 |
| 200 chars (warning end) | 200 | `"warning"` | `80` | F004-AC2 |
| 201 chars (error start) | 201 | `"error"` | `50` | F004-AC2 |
| 500 chars | 500 | `"error"` | `50` | F004-AC2 |
| Error message includes chars 155-160 snippet | 250-char desc | `message` contains substring from position 155 | F004-AC2 |

#### `scoreKeywordPresence(title, description, keyword)`

| Test case | Expected `score` | Expected `status` | AC ref |
|-----------|-----------------|-------------------|--------|
| Keyword (phrase) in title + description | `100` | `"good"` | F004-AC3 |
| Keyword in title + one keyword word in description | `100` | `"good"` | F004-AC3 |
| Keyword only in title | `90` | `"good"` | F004-AC3 |
| Keyword only in description (exact phrase) | `70` | `"warning"` | F004-AC3 |
| Keyword absent from both | `0` | `"error"` | F004-AC3 |
| Empty keyword | `0` | `"error"` | F004-AC3 |
| Whitespace-only keyword | `0` | `"error"` | F004-AC3 |
| Case-insensitive: `"KEYWORD"` vs `"keyword"` | `100` | `"good"` | F004-AC3 |
| Multi-word keyword, all words in title | `100` | `"good"` | F004-AC3 |
| Regex special chars in keyword (`c++`) | does not throw | any valid status | F004-AC3 |
| Keyword with parentheses (`(java)`) | does not throw | any valid status | F004-AC3 |
| Unicode keyword | correct match | — | F004-AC3 |

#### `checkMobileTruncation(title, description)`

| Test case | `titleTruncated` | `descriptionTruncated` | `totalIssues` | AC ref |
|-----------|-----------------|----------------------|---------------|--------|
| Both empty | `false` | `false` | `0` | F004-AC4 |
| Title exactly 50 chars | `false` | `false` | `0` | F004-AC4 |
| Title 51 chars | `true` | `false` | `1` | F004-AC4 |
| Desc exactly 120 chars | `false` | `false` | `0` | F004-AC4 |
| Desc 121 chars | `false` | `true` | `1` | F004-AC4 |
| Both over limit | `true` | `true` | `2` | F004-AC4 |
| Both at exact limits | `false` | `false` | `0` | F004-AC4 |

#### `calculateOverallScore(titleScore, descScore, keywordScore)`

| Test case | Inputs | Expected | AC ref |
|-----------|--------|----------|--------|
| All 100 | `(100, 100, 100)` | `100` | F004-AC5 |
| All 0 | `(0, 0, 0)` | `0` | F004-AC5 |
| `(100, 80, 60)` → 40+32+12 | — | `84` | F004-AC5 |
| `(0, 0, 100)` → keyword only | — | `20` | F004-AC5 |
| `(100, 0, 0)` → title only | — | `40` | F004-AC5 |
| `(0, 100, 0)` → desc only | — | `40` | F004-AC5 |
| Fractional rounds correctly `(33,33,33)` | — | `33` | F004-AC5 |
| Result is always integer (no decimals) | any inputs | `Number.isInteger(result)` | F004-AC5 |

#### `validateUrl(url)`

| Test case | Expected `valid` | AC ref |
|-----------|-----------------|--------|
| Empty string | `true` (URL is optional) | F001-AC3 |
| Whitespace-only | `true` | F001-AC3 |
| `"https://example.com"` | `true` | F001-AC3 |
| `"http://example.com/path?q=1#hash"` | `true` | F001-AC3 |
| `"ftp://example.com"` | `false` | F001-AC3 |
| `"//example.com"` (protocol-relative) | `false` | F001-AC3 |
| `"not a url"` | `false` | F001-AC3 |
| `"javascript:alert(1)"` | `false` | Security |
| `"data:text/html,..."` | `false` | Security |
| URL with spaces | `false` | F001-AC3 |

#### `extractDomain(url)` and `extractSlug(url)`

| Test case | Expected `domain` | Expected `slug` | AC ref |
|-----------|-------------------|-----------------|--------|
| `"https://example.com"` | `"example.com"` | `""` | F002-AC2 |
| `"https://www.example.com/blog/post"` | `"www.example.com"` | `"post"` | F002-AC2 |
| `"https://sub.example.com/a/b/c"` | `"sub.example.com"` | `"c"` | F002-AC2 |
| Empty string | `"example.com"` | `""` | F002-AC2 |
| Invalid URL | `"example.com"` | `""` | F002-AC2 |

#### `getScoreColor(status)` and `formatScore(score)`

| Test case | Expected output | AC ref |
|-----------|----------------|--------|
| `getScoreColor("good")` | string contains `"green"` | F004-AC1 |
| `getScoreColor("warning")` | string contains `"yellow"` | F004-AC1 |
| `getScoreColor("error")` | string contains `"red"` | F004-AC1 |
| `formatScore(0)` | `"0%"` | F004-AC5 |
| `formatScore(85)` | `"85%"` | F004-AC5 |
| `formatScore(100)` | `"100%"` | F004-AC5 |
| `formatScore(-10)` | `"0%"` (clamped at 0) | F004-AC5 |
| `formatScore(150)` | `"100%"` (clamped at 100) | F004-AC5 |
| `formatScore(85.7)` | `"86%"` (rounded) | F004-AC5 |

---

### 2.2 `src/lib/truncation.ts`

**Mock boundaries**: None — pure string functions.

#### `truncateAtChars(text, maxChars)`

| Test case | Input | Max | Expected | AC ref |
|-----------|-------|-----|----------|--------|
| Shorter than limit | `"Hello"` | `10` | `"Hello"` (no `…`) | F002-AC3 |
| Exactly at limit | `"A".repeat(60)` | `60` | no ellipsis appended | F002-AC3 |
| One over limit, mid-word | `"AAAAAAA"` | `5` | `"AAAAA…"` | F002-AC3 |
| Word boundary within 10 of limit | `"the quick brown fox jumps"` | `20` | breaks at last space before pos 20 | F002-AC3 |
| Word boundary > 10 from limit | `"thequickbrownfoxjumps over"` | `10` | hard cut + `…` | F002-AC3 |
| Empty string | `""` | `60` | `""` | F002-AC3 |
| Single-word string over limit | `"superlongword"` | `5` | `"super…"` | F002-AC3 |
| Space at exact boundary | `"hello world"` | `5` | `"hello…"` (no leading space before `…`) | F002-AC3 |

#### Per-engine truncation functions (boundary-value table)

| Function | Input length | Has `…` in output? | Max allowed length | AC ref |
|----------|-------------|--------------------|--------------------|--------|
| `truncateGoogleDesktopTitle` | 59 | No | 59 | F002-AC3 |
| `truncateGoogleDesktopTitle` | 60 | No | 60 | F002-AC3 |
| `truncateGoogleDesktopTitle` | 61 | Yes | 61 | F002-AC3 |
| `truncateGoogleDesktopDescription` | 160 | No | 160 | F002-AC4 |
| `truncateGoogleDesktopDescription` | 161 | Yes | 161 | F002-AC4 |
| `truncateGoogleMobileTitle` | 50 | No | 50 | F003-AC1 |
| `truncateGoogleMobileTitle` | 51 | Yes | 51 | F003-AC1 |
| `truncateGoogleMobileDescription` | 120 | No | 120 | F003-AC2 |
| `truncateGoogleMobileDescription` | 121 | Yes | 121 | F003-AC2 |
| `truncateBingTitle` | 65 | No | 65 | F005-AC2 |
| `truncateBingTitle` | 66 | Yes | 66 | F005-AC2 |
| `truncateBingDescription` | 160 | No | 160 | F005-AC3 |
| `truncateBingDescription` | 161 | Yes | 161 | F005-AC3 |

#### `highlightKeyword(text, keyword)`

| Test case | Expected result | AC ref |
|-----------|----------------|--------|
| Keyword absent | single segment `{text: originalText, isKeyword: false}` | F002-AC5 |
| Empty keyword | single segment `{isKeyword: false}` | F002-AC5 |
| Whole string is keyword | single segment `{isKeyword: true}` | F002-AC5 |
| Keyword in middle | 3 segments: pre / `{isKeyword:true}` / post | F002-AC5 |
| Multiple occurrences | alternating segments | F002-AC5 |
| Case-insensitive: `"SEO"` in `"best seo tips"` | segment with `isKeyword:true` | F002-AC5 |
| Regex special chars in keyword (`c++`) | does not throw; returns segments | F002-AC5 |
| Empty text | returns empty or `[{text:"", isKeyword:false}]` | F002-AC5 |
| Segments reconstruct original text | `segments.map(s=>s.text).join('') === text` | F002-AC5 |

#### `formatGoogleBreadcrumb(url)`

| Test case | Expected `domain` | Expected `breadcrumb` | AC ref |
|-----------|-------------------|-----------------------|--------|
| Empty string | `"example.com"` | `""` | F002-AC2 |
| `"https://example.com"` | `"example.com"` | `""` | F002-AC2 |
| `"https://www.example.com/blog/post"` | `"example.com"` (strips `www.`) | `"blog › post"` | F002-AC2 |
| `"https://example.com/a/b/c"` | `"example.com"` | `"a › b › c"` | F002-AC2 |
| Invalid URL string | `"example.com"` | `""` | F002-AC2 |
| URL with query string | domain only; no `?` in breadcrumb | — | F002-AC2 |

---

### 2.3 `src/lib/history.ts`

**Mock boundaries**: `localStorage` — use `vitest-localstorage-mock` or inline `vi.stubGlobal`.

#### `readHistory()`

| Test case | Setup | Expected | AC ref |
|-----------|-------|---------|--------|
| Empty localStorage | nothing stored | `[]` | F010-AC3 |
| Valid JSON array | stored valid entries | parsed array | F010-AC3 |
| Corrupt JSON | `localStorage.setItem(key, "not json")` | `[]` (no throw) | F010-AC4 |
| Non-array JSON | `localStorage.setItem(key, '{"a":1}')` | `[]` | F010-AC4 |
| localStorage.getItem throws | `vi.fn().mockImplementation(() => { throw new Error() })` | `[]` | F010-AC4 |

#### `saveHistoryEntry(entry)`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| First entry stored | `readHistory()` returns 1-element array after save | F010-AC3 |
| Generated `id` is a string with timestamp prefix | `id` matches `/^\d+-[a-z0-9]{5}$/` | F010-AC3 |
| `timestamp` is near `Date.now()` | `|timestamp - Date.now()| < 1000` | F010-AC3 |
| Newest entry at index 0 | save two entries; first saved is at index 0 | F010-AC1 |
| Deduplication: same title+desc+url | existing entry removed; new one inserted at 0 | F010-AC1 |
| Cap at 20: saving 21st entry | array length = 20; oldest dropped | F010-AC1 |
| localStorage throws | returns `null` (no crash) | F010-AC4 |

#### `deleteHistoryEntry(id)`, `clearHistory()`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| Delete existing id | entry removed; others remain | F010-AC1 |
| Delete non-existent id | no-op; no crash | F010-AC1 |
| Delete with localStorage throws | no crash | F010-AC4 |
| `clearHistory()` removes the key | `readHistory()` returns `[]` after | F010-AC1 |
| `clearHistory()` with localStorage throws | no crash | F010-AC4 |

#### `formatHistoryDate(timestamp)`

| Elapsed time | Expected output | AC ref |
|-------------|----------------|--------|
| < 60 seconds | `"Just now"` | F010-AC1 |
| 1 minute exactly | `"1m ago"` | F010-AC1 |
| 90 minutes | `"1h ago"` | F010-AC1 |
| 23 hours | `"23h ago"` | F010-AC1 |
| 1 day | `"1d ago"` | F010-AC1 |
| 6 days | `"6d ago"` | F010-AC1 |
| 7+ days | locale date string e.g. `"Jan 1"` | F010-AC1 |

---

### 2.4 `src/lib/bulk.ts`

**Mock boundaries**: `URL.createObjectURL`, `document.createElement` in `downloadCsv`.

#### `parseCsv(csvText)`

| Test case | Input | Expected | AC ref |
|-----------|-------|---------|--------|
| Fewer than 2 lines | `"title"` | `[]` | F011-AC1 |
| No `title` column | `"foo,bar\n1,2"` | `[]` | F011-AC1 |
| Minimal: title only | `"title\nMy Post"` | `[{title:"My Post", description:"", url:"", keyword:undefined}]` | F011-AC1 |
| All 4 columns, standard order | header + 1 data row | correct field mapping | F011-AC1 |
| Columns in non-standard order (desc before title) | `"description,title\nD,T"` | `{title:"T", description:"D"}` | F011-AC1 |
| Quoted field with comma | `'"Hello, World"'` | `"Hello, World"` | F011-AC1 |
| Escaped double-quote `""` inside quotes | `'"Say ""hi"""'` | `'Say "hi"'` | F011-AC1 |
| CRLF line endings | rows separated by `\r\n` | same result as `\n` | F011-AC1 |
| Blank lines between data rows | blank lines skipped | correct row count | F011-AC1 |
| Header case-insensitive | `"Title,Description"` | maps correctly | F011-AC1 |
| 500 data rows | 500-line CSV | 500 rows returned | F011-AC2 |
| 501 data rows | 501-line CSV | 501 returned (slicing done by `processBulkRows`) | F011-AC2 |

#### `scoreBulkRow(row)` and `processBulkRows(rows)`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| Good title+desc+kw → all statuses `"good"` | — | F011-AC1 |
| Empty title → `titleStatus: "error"`, `titleScore: 0` | — | F011-AC1 |
| No keyword (`undefined`) → `keywordScore: 0` | — | F011-AC1 |
| `overallScore` equals `calculateOverallScore(titleScore, descScore, kwScore)` | consistency | F011-AC1 |
| 0 rows → `[]` | — | F011-AC1 |
| 501 rows → first 500 only | — | F011-AC2 |
| 500 rows complete in < 5000 ms | `performance.now()` delta | F011-AC2 |

#### `exportResultsToCsv(results)`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| First row is header with expected columns | check line 0 | F011-AC3 |
| Data rows match input | spot-check values | F011-AC3 |
| Field with comma is quoted | `"Hello, World"` | F011-AC3 |
| Field with `"` is escaped | `He said "hi"` → `"He said ""hi"""` | F011-AC3 |
| Field with newline is quoted | `"line1\nline2"` | F011-AC3 |
| Round-trip: parse CSV → score → export → re-parse | row count integrity | F011-AC3 |

#### `downloadCsv(content, filename)`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| Creates `Blob` with `text/csv` MIME | spy on `Blob` constructor | F011-AC3 |
| `<a>` element has correct `download` attribute | spy on `document.createElement` | F011-AC3 |
| Revokes object URL after click | `URL.revokeObjectURL` called once | F011-AC3 |
| Default filename `"seo-bulk-results.csv"` when none given | — | F011-AC3 |

---

### 2.5 `src/lib/embed.ts`

**Mock boundaries**: `APP.url` constant (set via `vi.mock` or configure in env).

#### `generateEmbedCode(options)`

| Test case | Expected in output | AC ref |
|-----------|-------------------|--------|
| No options → `/embed` with no query string | `src="…/embed"` (no `?`) | F008-AC1 |
| No options → height `"700"` | `height="700"` | F008-AC1 |
| `compactMode: true` → `?compact=true` | query param present | F008-AC1 |
| `compactMode: true` → height `"450"` | `height="450"` | F008-AC1 |
| `showScores: false` → `?showScores=false` | param present | F008-AC1 |
| `showScores: true` → no `showScores` param | param absent (default is true) | F008-AC1 |
| `showPreviews: false` → `?showPreviews=false` | param present | F008-AC1 |
| `defaultTitle: "My Title"` → `?title=My+Title` | URL-encoded param | F008-AC1 |
| `defaultUrl: "https://ex.com"` → encoded | URL-encoded | F008-AC1 |
| All options combined | all params present | F008-AC1 |
| Output contains `width="100%"` | responsive | F008-AC4 |
| Output contains `min-width: 320px` in style | min-width spec | F008-AC4 |
| Output contains `loading="lazy"` | performance | F008-AC1 |
| Output has `title="SEO Meta Preview & Scorer"` | accessibility | F008-AC1 |

#### `parseWidgetOptions(searchParams)`

| Test case | Input params | Expected options | AC ref |
|-----------|-------------|-----------------|--------|
| Empty params | none | `{}` | F008-AC2 |
| `showScores=false` | — | `{showScores: false}` | F008-AC2 |
| `showScores=true` | — | `{}` (no explicit false) | F008-AC2 |
| `showPreviews=false` | — | `{showPreviews: false}` | F008-AC2 |
| `compact=true` | — | `{compactMode: true}` | F008-AC2 |
| `title=Hello` | — | `{defaultTitle: "Hello"}` | F008-AC2 |
| All params combined | — | all options set | F008-AC2 |
| Unknown param | — | ignored; not in returned object | F008-AC2 |
| Round-trip: `generateEmbedCode(opts)` → parse src URL → `parseWidgetOptions` | options preserved | F008-AC2 |

---

### 2.6 `src/lib/screenshot.ts`

**Mock boundaries**: dynamic `import("html2canvas")`, `canvas.toBlob`, `URL.createObjectURL`, `document.body.appendChild`.

| Test case | Description | AC ref |
|-----------|-------------|--------|
| `captureAndDownload()` — happy path returns `{success: true}` | mock html2canvas + canvas | F007-AC1 |
| `captureAndDownload()` — html2canvas called with `scale: 2` (default) | check options | F007-AC1 |
| `captureAndDownload()` — `addWatermark` writes to canvas context | spy on `ctx.fillText` | F007-AC3 |
| `captureAndDownload()` — `<a>.download` includes timestamp + `.png` | spy on element | F007-AC1 |
| `captureAndDownload()` — JPEG format → `image/jpeg`, quality 0.9 | check `toBlob` args | F007-AC1 |
| `captureAndDownload()` — `toBlob` returns null → `{success: false}` | mock null blob | F007-AC1 |
| `captureAndDownload()` — html2canvas throws → `{success: false, error}` | mock throw | F007-AC1 |
| `captureAndDownload()` — `URL.revokeObjectURL` called after click | spy | F007-AC1 |
| Watermark text contains `APP.url` | spy `ctx.fillText` arg | F007-AC3 |
| Watermark `fillRect` y-offset = `canvas.height - watermarkHeight` | geometry check | F007-AC3 |
| Watermark `fillRect` spans full width | `fillRect` width === `canvasWidth` | F007-AC3 |

---

### 2.7 Hooks

#### `useMetaInput` — `src/lib/hooks/useMetaInput.ts`

**Test env**: jsdom + `renderHook` from `@testing-library/react`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| Initial state has string fields | `title`, `description`, `url`, `keyword` exist | F001-AC4 |
| `setTitle("")` → title is `""` | re-render | F001-AC1 |
| `setTitle("Hello")` → `titleScore.status` updates | scoring recomputes | F004-AC1 |
| `setDescription("…150 chars…")` → `descScore.status === "good"` | — | F004-AC2 |
| `setKeyword("SEO")` → `keywordScore` reflects keyword check | — | F004-AC3 |
| `setTitle` with 55 chars → `mobileTruncation.titleTruncated === true` | — | F004-AC4 |
| `overallScore` is in `[0, 100]` for any input | — | F004-AC5 |

#### `useScores` — `src/lib/hooks/useScores.ts`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| Returns all four score fields | `title`, `description`, `keyword`, `overall` | F004-AC5 |
| No keyword → `keyword.status === "error"` | — | F004-AC3 |
| Scores consistent with `calculateOverallScore` | `overall === calculateOverallScore(...)` | F004-AC5 |
| Memoization: same props → same object reference | `useMemo` not re-running unnecessarily | F001-AC5 |

#### `useTheme` — `src/lib/hooks/useTheme.ts`

**Mock boundaries**: `localStorage`, `window.matchMedia`, `document.documentElement.classList`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| System dark pref → initial `theme === "dark"` | `matchMedia` returns `matches: true` | F009-AC1 |
| System light pref → initial `theme === "light"` | `matches: false` | F009-AC1 |
| localStorage override beats system pref | stored `"light"` while system=dark | F009-AC4 |
| Toggle light → dark → `classList.add("dark")` called | — | F009-AC2 |
| Toggle dark → light → `classList.remove("dark")` called | — | F009-AC2 |
| After toggle, `localStorage.setItem` called with new theme | — | F009-AC4 |
| localStorage unavailable → falls back to system pref; no crash | `localStorage` throws | F009-AC4 |

#### `useHistory` — `src/lib/hooks/useHistory.ts`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| Mount with empty storage → `history === []` | — | F010-AC1 |
| Mount reads existing entries from localStorage | pre-populate storage | F010-AC1 |
| `save()` adds entry to front of `history` | — | F010-AC1 |
| `remove(id)` removes that entry | — | F010-AC1 |
| `clear()` empties `history` | — | F010-AC1 |
| localStorage unavailable → `history === []`; no crash | — | F010-AC4 |

---

## 3. Integration Tests (Component + API)

### 3.1 `MetaInputForm` Component

**File**: `src/components/input/MetaInputForm.test.tsx`
**Required `data-testid` attrs**: `title-input`, `description-input`, `url-input`, `keyword-input`, `url-error`, `title-char-count`, `description-char-count`

| Test case | User action | Expected DOM state | AC ref |
|-----------|------------|-------------------|--------|
| Renders title input | initial render | `[data-testid="title-input"]` is in document | F001-AC1 |
| Title char count reflects typed length | type 45-char title | `[data-testid="title-char-count"]` text contains `"45"` | F001-AC1 |
| Description char count updates | type 150-char description | counter shows `"150"` | F001-AC2 |
| Invalid URL shows error | `userEvent.type(urlInput, "not a url")` then blur | `[data-testid="url-error"]` visible with text | F001-AC3 |
| Valid URL clears error | change to `"https://example.com"` | error element absent | F001-AC3 |
| Empty URL — no error shown | clear URL field | error element absent | F001-AC3 |
| `onChange` prop called on title change | spy on callback | called with new title string | F001-AC1 |
| All 4 inputs have accessible labels | `getByLabelText` | each input found | NFR-A11y |
| Tab order is logical | `userEvent.tab()` sequence | focus: title → desc → url → keyword | NFR-A11y |

### 3.2 `CharacterCounter` Component

**File**: `src/components/input/CharacterCounter.test.tsx`
**Required `data-testid`**: `char-counter`

| Test case | Props | Expected | AC ref |
|-----------|-------|---------|--------|
| Below optimal range | `{current:5, min:30, max:60}` | red/warning color class | F001-AC1 |
| Within optimal range | `{current:45, min:30, max:60}` | green color class | F001-AC1 |
| Between optimal and soft max | `{current:65, min:30, max:60, softMax:70}` | yellow class | F001-AC1 |
| Above soft max | `{current:75, min:30, max:60, softMax:70}` | red class | F001-AC1 |
| Shows `current` value | `{current:45, max:60}` | "45" in text content | F001-AC1 |

### 3.3 `GoogleDesktopPreview` Component

**File**: `src/components/preview/GoogleDesktopPreview.test.tsx`
**Required `data-testid`**: `google-desktop-preview`, `google-title`, `google-url`, `google-description`

| Test case | Props | Expected | AC ref |
|-----------|-------|---------|--------|
| Title renders | title="Hello World" | `[data-testid="google-title"]` contains "Hello World" | F002-AC1 |
| Title has blue colour class | render | title element has Google-blue color style/class | F002-AC1 |
| URL displays as breadcrumb | url="https://example.com/blog/post" | shows `"example.com › blog › post"` | F002-AC2 |
| Empty URL → fallback domain | url="" | shows `"example.com"` | F002-AC2 |
| Title truncated at 60 chars | 70-char title | rendered text ends with `"…"` | F002-AC3 |
| Title not truncated at exactly 60 | 60-char title | no `"…"` appended | F002-AC3 |
| Description truncated at 160 | 200-char desc | rendered text ends with `"…"` | F002-AC4 |
| Keyword bolded in title | title has keyword | `<strong>` or bold `<span>` around keyword | F002-AC5 |
| Keyword bolded in description | desc has keyword | bold span in description | F002-AC5 |
| No keyword → no bold spans | keyword="" | no `<strong>` tags | F002-AC5 |
| Empty title renders without crash | title="" | component renders | F001-AC4 |

### 3.4 `GoogleMobilePreview` Component

**File**: `src/components/preview/GoogleMobilePreview.test.tsx`
**Required `data-testid`**: `google-mobile-preview`, `google-mobile-title`, `google-mobile-description`

| Test case | Props | Expected | AC ref |
|-----------|-------|---------|--------|
| Container width ≤ 360px | render | element has `width: 360px` or `max-width: 360px` in style | F003-AC3 |
| Title truncated at 50 chars | 60-char title | ends with `"…"` | F003-AC1 |
| Title not truncated at exactly 50 | 50-char title | no `"…"` | F003-AC1 |
| Description truncated at 120 | 150-char desc | ends with `"…"` | F003-AC2 |
| Font size property < 20px | render | CSS font-size smaller than desktop | F003-AC4 |
| Keyword bolded | keyword present in title | bold span present | F002-AC5 |

### 3.5 `BingPreview` Component

**File**: `src/components/preview/BingPreview.test.tsx`
**Required `data-testid`**: `bing-preview`, `bing-title`, `bing-url`, `bing-description`

| Test case | Props | Expected | AC ref |
|-----------|-------|---------|--------|
| Title colour is Bing blue `#001ba0` | render | title element has `#001ba0` | F005-AC1 |
| URL colour is Bing green `#006d21` | render | url element has `#006d21` | F005-AC1 |
| Font family contains `"Segoe UI"` | render | CSS font-family of title | F005-AC1 |
| Title truncated at 65 chars | 70-char title | ends with `"…"` | F005-AC2 |
| Title not truncated at exactly 65 | 65-char title | no `"…"` | F005-AC2 |
| Description truncated at 160 | 180-char desc | ends with `"…"` | F005-AC3 |

### 3.6 `SocialCardPreview` Component

**File**: `src/components/preview/SocialCardPreview.test.tsx`
**Required `data-testid`**: `social-card-preview`, `og-image-placeholder`, `og-image`, `og-title`, `og-description`, `og-domain`

| Test case | Props | Expected | AC ref |
|-----------|-------|---------|--------|
| No OG image → placeholder shown | `ogImage=""` | `[data-testid="og-image-placeholder"]` visible | F006-AC2 |
| Placeholder mentions 1200×630 or "Add OG Image" | `ogImage=""` | placeholder text contains dimension/prompt | F006-AC2 |
| OG image URL → `<img>` rendered | `ogImage="https://..."` | `<img src="https://...">` present | F006-AC3 |
| Image `onError` → placeholder shown | simulate error event | placeholder appears | F006-AC3 |
| Falls back to `title` if no `ogTitle` | `title="Page", ogTitle=""` | "Page" shown | F006-AC1 |
| `ogTitle` takes precedence over `title` | `title="A", ogTitle="B"` | "B" shown | F006-AC1 |
| Domain shown at bottom | `url="https://example.com"` | "example.com" in `[data-testid="og-domain"]` | F006-AC4 |
| DOM order: image → title → desc → domain | render | correct child order | F006-AC4 |

### 3.7 `ScoreDashboard` Component

**File**: `src/components/scoring/ScoreDashboard.test.tsx`
**Required `data-testid`**: `score-dashboard`, `title-score-card`, `description-score-card`, `keyword-score-card`, `overall-score`, `mobile-truncation-warning`

| Test case | Props | Expected | AC ref |
|-----------|-------|---------|--------|
| Title `"good"` → green badge | titleScore.status="good" | green Tailwind class on title card | F004-AC1 |
| Title `"warning"` → yellow badge | status="warning" | yellow class | F004-AC1 |
| Title `"error"` → red badge | status="error" | red class | F004-AC1 |
| Score message rendered | any score | `titleScore.message` text visible | F004-AC1 |
| Overall score number shown | overallScore=85 | "85" in `[data-testid="overall-score"]` | F004-AC5 |
| Mobile warning shown when truncated | `titleTruncated=true` | `[data-testid="mobile-truncation-warning"]` visible | F004-AC4 |
| Mobile warning hidden when not truncated | both false | warning element absent | F004-AC4 |
| Keyword card rendered | any keyword score | `[data-testid="keyword-score-card"]` present | F004-AC3 |

### 3.8 `OverallScoreGauge` Component

**File**: `src/components/scoring/OverallScoreGauge.test.tsx`

| Test case | `score` prop | Expected colour indicator | AC ref |
|-----------|-------------|--------------------------|--------|
| Score 80–100 | 90 | green class | F004-AC5 |
| Score 50–79 | 65 | yellow class | F004-AC5 |
| Score 0–49 | 30 | red class | F004-AC5 |
| Exact boundary 80 | 80 | green | F004-AC5 |
| Exact boundary 50 | 50 | yellow | F004-AC5 |
| Score 0 | 0 | "0" text, red | F004-AC5 |
| Score 100 | 100 | "100" text, green | F004-AC5 |
| Has `aria-valuenow` | any | attribute set to score value | NFR-A11y |

### 3.9 `ScreenshotButton` Component

**File**: `src/components/export/ScreenshotButton.test.tsx`
**Mock**: `vi.mock('@/lib/screenshot')` → `captureAndDownload`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| Button renders and is accessible | `getByRole("button", {name: /screenshot/i})` | F007-AC1 |
| Click calls `captureAndDownload` with element ref | spy resolves | called once | F007-AC1 |
| Spinner visible during loading | mock slow promise | `[data-testid="screenshot-spinner"]` present | F007-AC4 |
| Spinner hidden after completion | promise resolves | spinner gone | F007-AC4 |
| Button disabled during loading | while pending | `disabled` or `aria-disabled` attr | F007-AC4 |
| Error message on failure | mock rejects with error | error text visible | F007-AC1 |

### 3.10 `EmbedCodeGenerator` Component

**File**: `src/components/embed/EmbedCodeGenerator.test.tsx`
**Required `data-testid`**: `embed-code-output`, `copy-button`, `compact-toggle`, `show-scores-toggle`, `show-previews-toggle`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| `<iframe` present in initial code output | render | code contains `<iframe` | F008-AC1 |
| Compact toggle changes height to `"450"` | click toggle | `height="450"` in code | F008-AC1 |
| Show-scores toggle adds `showScores=false` | toggle off | param in src | F008-AC1 |
| Copy button calls `navigator.clipboard.writeText` | click, mock clipboard | called with embed code | F008-AC1 |
| Copy success shows feedback | mock resolves | "Copied!" or similar text | F008-AC1 |

### 3.11 `HistoryPanel` Component

**File**: `src/components/history/HistoryPanel.test.tsx`
**Required `data-testid`**: `history-panel`, `history-entry`, `history-entry-title`, `history-entry-score`, `history-entry-time`, `history-entry-delete`, `history-clear-all`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| Empty history → empty-state message | no localStorage entries | empty state text visible | F010-AC1 |
| Renders up to 20 entries | 20 entries in storage | 20 `[data-testid="history-entry"]` elements | F010-AC1 |
| Entry shows title text | mock data | title text in element | F010-AC1 |
| Entry shows overall score | mock data | score visible | F010-AC1 |
| Entry shows relative timestamp | mock data | time text visible | F010-AC1 |
| Click entry → `onSelect` callback | click entry | called with correct `HistoryEntry` | F010-AC2 |
| Delete button removes entry from DOM | click delete | entry removed | F010-AC1 |
| Clear all removes all entries | click clear-all | no history entries remain | F010-AC1 |
| localStorage unavailable → no crash | remove `localStorage` | graceful empty state | F010-AC4 |

### 3.12 `BulkCheckPanel` Component

**File**: `src/components/bulk/BulkCheckPanel.test.tsx`
**Required `data-testid`**: `bulk-panel`, `csv-file-input`, `bulk-results-table`, `bulk-export-button`, `bulk-error`

| Test case | Description | AC ref |
|-----------|-------------|--------|
| File input accepts `.csv` | `accept` attribute | `accept=".csv"` | F011-AC1 |
| Upload valid 5-row CSV → table with 5 rows | mock FileReader | `bulk-results-table` has 5 rows | F011-AC1 |
| CSV without title column → error message | upload bad CSV | `[data-testid="bulk-error"]` visible | F011-AC1 |
| Export button calls `downloadCsv` | click, mock lib | `downloadCsv` called | F011-AC3 |
| Empty state before upload | initial render | no table | F011-AC1 |
| Drag-and-drop triggers same processing | mock drop event | table renders | F011-AC1 |

### 3.13 API Route: `GET /api/fetch-meta`

**File**: `src/app/api/fetch-meta/route.test.ts`
**Approach**: Instantiate `NextRequest`, call handler directly, mock global `fetch`.

| Test case | Request | Status | Body | AC ref |
|-----------|---------|--------|------|--------|
| No `url` param | `GET /api/fetch-meta` | 400 | `{error: "URL parameter is required"}` | F012-AC1 |
| Invalid URL format | `?url=not-a-url` | 400 | `{error: "Invalid URL format"}` | F012-AC1 |
| Non-http/https protocol (`ftp://`) | `?url=ftp://…` | 400 | `{error: "Only http/https URLs are supported"}` | F012-AC1 |
| `javascript:` URI | `?url=javascript:alert(1)` | 400 | error | Security |
| Upstream HTTP 404 | mock fetch → 404 | 502 | `{error: "…HTTP 404"}` | F012-AC3 |
| Non-HTML content-type | mock → `Content-Type: application/json` | 400 | `{error: "URL does not return an HTML page"}` | F012-AC3 |
| Abort error (timeout) | mock → throws `AbortError` | 504 | `{error: "Request timed out…"}` | F012-AC3 |
| Network error | mock → throws generic `Error` | 502 | `{error: "Failed to fetch URL…"}` | F012-AC3 |
| Happy path — `<title>Hello</title>` | mock → valid HTML | 200 | `{title: "Hello"}` | F012-AC1 |
| Happy path — meta description | standard `name=description content=…` | 200 | `{description: "Desc"}` | F012-AC1 |
| Happy path — reversed attr order | `content=… name=description` | 200 | `{description: "Desc"}` | F012-AC1 |
| Happy path — og:title | `property="og:title" content="OG"` | 200 | `{ogTitle: "OG"}` | F012-AC1 |
| Happy path — og:description | — | 200 | `{ogDescription: "…"}` | F012-AC1 |
| Happy path — og:image | — | 200 | `{ogImage: "https://…"}` | F012-AC1 |
| HTML entity: `&amp;` → `&` | `<title>A &amp; B</title>` | 200 | `{title: "A & B"}` | F012-AC1 |
| HTML entity: `&quot;` → `"` | — | 200 | decoded | F012-AC1 |
| HTML entity: `&#39;` → `'` | — | 200 | decoded | F012-AC1 |
| Empty page (no meta tags) | `<html></html>` | 200 | all fields are `""` | F012-AC1 |
| Title whitespace trimmed | `<title>  Hello  </title>` | 200 | `{title: "Hello"}` | F012-AC1 |
| Correct User-Agent sent | spy on `fetch` call args | — | headers contain `SEO-Meta-Preview-Bot` | Security |

### 3.14 API Route: `GET /api/og`

**File**: `src/app/api/og/route.test.ts`
**Note**: `ImageResponse` is hard to unit-test; use smoke tests.

| Test case | Request | Expected | AC ref |
|-----------|---------|---------|--------|
| Valid params render without crash | `?title=Hello&score=85` | Response is not null | NFR-SEO |
| Content-Type is `image/png` | — | `content-type: image/png` header | NFR-SEO |

---

## 4. E2E Tests (Playwright)

### 4.1 Shared Page Objects

```typescript
// e2e/page-objects/MainPage.ts
export const sel = {
  // Input
  titleInput:       '[data-testid="title-input"]',
  descInput:        '[data-testid="description-input"]',
  urlInput:         '[data-testid="url-input"]',
  keywordInput:     '[data-testid="keyword-input"]',
  titleCharCount:   '[data-testid="title-char-count"]',
  descCharCount:    '[data-testid="description-char-count"]',
  urlError:         '[data-testid="url-error"]',
  fetchButton:      '[data-testid="url-fetch-button"]',
  fetchSpinner:     '[data-testid="fetch-spinner"]',
  fetchError:       '[data-testid="fetch-error"]',
  // Preview tabs
  tabGoogleDesktop: '[data-testid="tab-google-desktop"]',
  tabGoogleMobile:  '[data-testid="tab-google-mobile"]',
  tabBing:          '[data-testid="tab-bing"]',
  tabSocial:        '[data-testid="tab-social"]',
  // Preview content
  googleDesktop:    '[data-testid="google-desktop-preview"]',
  googleTitle:      '[data-testid="google-title"]',
  googleUrl:        '[data-testid="google-url"]',
  googleDesc:       '[data-testid="google-description"]',
  googleMobile:     '[data-testid="google-mobile-preview"]',
  googleMobileTitle:'[data-testid="google-mobile-title"]',
  bingPreview:      '[data-testid="bing-preview"]',
  socialPreview:    '[data-testid="social-card-preview"]',
  ogPlaceholder:    '[data-testid="og-image-placeholder"]',
  // Scoring
  overallScore:     '[data-testid="overall-score"]',
  titleScoreCard:   '[data-testid="title-score-card"]',
  descScoreCard:    '[data-testid="description-score-card"]',
  keywordScoreCard: '[data-testid="keyword-score-card"]',
  mobileWarn:       '[data-testid="mobile-truncation-warning"]',
  // Actions
  screenshotBtn:    '[data-testid="screenshot-button"]',
  screenshotSpinner:'[data-testid="screenshot-spinner"]',
  themeToggle:      '[data-testid="theme-toggle"]',
  historyToggle:    '[data-testid="history-toggle"]',
  historyPanel:     '[data-testid="history-panel"]',
  historyEntry:     '[data-testid="history-entry"]',
  historyClearAll:  '[data-testid="history-clear-all"]',
  bulkPanel:        '[data-testid="bulk-panel"]',
  csvFileInput:     '[data-testid="csv-file-input"]',
  bulkResultsTable: '[data-testid="bulk-results-table"]',
  bulkExport:       '[data-testid="bulk-export-button"]',
  bulkError:        '[data-testid="bulk-error"]',
  embedCodeOutput:  '[data-testid="embed-code-output"]',
  copyButton:       '[data-testid="copy-button"]',
  poweredByLink:    '[data-testid="powered-by-link"]',
} as const;
```

### 4.2 `e2e/main-flow.spec.ts` — Primary User Journey

Covers: **F001-AC1, AC2, AC3, AC4, AC5 · F002-AC1, AC2, AC3, AC4, AC5 · F003-AC1, AC3 · F004-AC4 · F005-AC1 · F006-AC2**

```
Scenario: Content creator types metadata and sees live previews

Given  I navigate to /
When   I type "10 Best SEO Tips for 2024" in the title field
Then   the title char count shows "25"
And    the Google Desktop preview title shows "10 Best SEO Tips for 2024"
And    the title score card shows a green badge

When   I type a 155-character description
Then   the description char count shows "155"
And    the description score card shows green

When   I type "https://example.com/blog/seo-tips" in the URL field
Then   the Google Desktop URL area shows "example.com › blog › seo-tips"
And    no URL error message appears

When   I type "SEO tips" in the keyword field
Then   the keyword score card shows "good"
And    "SEO" or "SEO tips" is bolded in the Google Desktop title

When   I click the Google Mobile tab
Then   the mobile preview renders in a container ≤ 360px wide

When   I click the Bing tab
Then   the Bing preview renders (visually distinct blue shade)

When   I click the Social Card tab
Then   the OG image placeholder is visible

Scenario: Placeholder values on empty load (F001-AC4)

Given  I navigate to / with no stored data
Then   the previews show default example content (not blank/empty)
And    score cards show non-zero scores

Scenario: Invalid URL validation (F001-AC3)

Given  I navigate to /
When   I type "not a url" in the URL field and blur
Then   an error message appears below the URL field
When   I change to "https://example.com"
Then   the error disappears

Scenario: Title too long — truncation and score (F002-AC3, F004-AC1)

Given  I type a 75-character title
Then   the Google Desktop preview title ends with "…"
And    the title score card shows a red badge
And    the score message mentions truncation

Scenario: Mobile truncation warning (F004-AC4)

Given  I type a 55-character title
Then   the mobile truncation warning is visible
When   I shorten the title to 45 characters
Then   the mobile truncation warning is hidden
```

### 4.3 `e2e/scoring.spec.ts` — Score Accuracy (F004)

```
Scenario: All green (F004-AC1, AC2, AC3, AC5)

Given  title=45 chars, description=150 chars, keyword in both
Then   title score is "good", description score is "good", keyword score is "good"
And    overall score ≥ 80 and shows green

Scenario: Overall score is weighted average (F004-AC5)

Given  title=100pts, description=100pts, no keyword (score=0)
Then   overall score displays "80" (40+40+0=80)

Scenario: Title length boundary tests (F004-AC1)

title = 30 chars  → green badge
title = 60 chars  → green badge
title = 61 chars  → yellow badge
title = 70 chars  → yellow badge
title = 71 chars  → red badge
title = 5 chars   → red badge

Scenario: Description length boundary tests (F004-AC2)

desc = 119 chars  → yellow badge
desc = 120 chars  → green badge
desc = 160 chars  → green badge
desc = 161 chars  → yellow badge
desc = 201 chars  → red badge
```

### 4.4 `e2e/screenshot.spec.ts` — Export (F007)

```
Scenario: Download PNG on click (F007-AC1, AC4)

Given  I have title + description + URL filled in
When   I click "Download Screenshot"
Then   a loading spinner appears
And    within 2 seconds a file download is triggered
And    the downloaded filename ends with ".png"
And    the file size is > 0 bytes

Scenario: Only preview area captured (F007-AC2)

[Use page.route() to intercept html2canvas; verify element passed does not
 include the form or score containers — check element's data-testid or
 take a visual screenshot of the preview container only]

Scenario: Watermark appears (F007-AC3)

[Visual test: after download, open the image blob URL and verify
 the bottom row contains watermark text by pixel sampling or text match]
```

**Note**: Use `page.waitForEvent('download')` to capture download events.

### 4.5 `e2e/embed.spec.ts` — Embeddable Widget (F008)

```
Scenario: Embed code shown at /widget (F008-AC1)

Given  I navigate to /widget
Then   an <iframe> code snippet is displayed
When   I click "Copy Code"
Then   the clipboard contains a valid iframe tag with src containing "/embed"

Scenario: Compact mode changes height (F008-AC1)

Given  I navigate to /widget
When   I toggle compact mode on
Then   the embed code height attribute changes to "450"
When   I toggle it off
Then   height changes back to "700"

Scenario: Widget renders at /embed (F008-AC2, AC3, AC4, AC5)

Given  I navigate to /embed
Then   the page renders without errors
And    a "Powered by" link is visible with href containing the tool's domain
And    the link has target="_blank"
And    the rendered width is at least 320px
When   I type a title in the embedded form
Then   the preview updates (scores and previews respond)

Scenario: X-Frame-Options headers (security + F008-AC2)

Given  I request GET /
Then   response header "x-frame-options" equals "DENY"

Given  I request GET /embed
Then   response does NOT include "x-frame-options: deny"
```

### 4.6 `e2e/dark-mode.spec.ts` — Dark Mode (F009)

```
Scenario: System dark preference applied on load (F009-AC1)

Given  I emulate prefers-color-scheme: dark (page.emulateMedia)
When   I navigate to /
Then   the <html> element has class "dark"

Scenario: Toggle applies dark mode (F009-AC2)

Given  I navigate to / in light mode
When   I click the theme toggle
Then   the <html> element gains class "dark"
And    the change completes within 100ms (no perceptible delay)

Scenario: SERP previews stay light in dark mode (F009-AC3)

Given  dark mode is active
Then   the Google Desktop preview has a white background
And    the Bing preview has a white background

Scenario: Theme persists after reload (F009-AC4)

Given  I toggle to dark mode
When   I reload the page
Then   dark mode is still active (class "dark" on <html>)
And    there is no flash of light content before dark mode loads
```

### 4.7 `e2e/history.spec.ts` — Recent Checks (F010)

```
Scenario: History saves and displays (F010-AC1, AC3)

Given  I navigate to / and fill title + description + URL
And    history auto-saves (or I trigger save action)
When   I open the history panel
Then   an entry with my title appears
And    an overall score is shown
And    a timestamp like "Just now" is visible

Scenario: History entry reloads data (F010-AC2)

Given  there is a history entry with title "Title A"
When   I clear all fields and click the history entry for "Title A"
Then   the title field repopulates with "Title A"
And    the previews update

Scenario: Delete individual entry (F010-AC1)

Given  there are 3 history entries
When   I click delete on the first
Then   2 entries remain

Scenario: Graceful degradation (F010-AC4)

Given  localStorage is blocked (page.addInitScript → throw on access)
When   I navigate to /
Then   no JavaScript errors are thrown
And    the history panel shows empty state or is absent
```

### 4.8 `e2e/bulk.spec.ts` — Bulk CSV (F011)

```
Scenario: Upload and score CSV (F011-AC1)

Given  I open the Bulk Check panel
When   I upload a 5-row CSV with columns title,description,url,keyword
Then   a results table appears with 5 scored rows
And    each row shows title score, description score, and overall score

Scenario: CSV missing title column (F011-AC1)

Given  I upload a CSV with columns "foo,bar"
Then   an error message appears
And    no results table appears

Scenario: 500-row CSV completes in time (F011-AC2)

Given  I upload a 500-row CSV
Then   all 500 rows appear in the results table
And    the total time from upload to table render is < 5 seconds

Scenario: Export results (F011-AC3)

Given  bulk results are displayed
When   I click "Export Results"
Then   a file download is triggered with extension ".csv"
```

### 4.9 `e2e/url-fetch.spec.ts` — URL Auto-fetch (F012)

```
Scenario: Fetch populates fields (F012-AC1, AC2)

Given  I intercept GET /api/fetch-meta to return:
       {title:"Fetched Title", description:"Fetched Desc", ogTitle:"", ogDescription:"", ogImage:"", url:"https://ex.com"}
When   I type "https://ex.com" in the URL field and click "Fetch"
Then   a loading spinner is displayed
And    the title field populates with "Fetched Title"
And    the description field populates with "Fetched Desc"

Scenario: Fetch error shows message (F012-AC3)

Given  /api/fetch-meta returns 502
When   I click "Fetch"
Then   an error message appears suggesting manual entry
And    no data is auto-populated

Scenario: Timeout error (F012-AC3)

Given  /api/fetch-meta returns 504
When   I click "Fetch"
Then   a timeout error message is shown
```

### 4.10 `e2e/accessibility.spec.ts` — WCAG 2.2 AA (NFR)

```
Scenario: Axe scan — main page

Given  I navigate to /
Then   @axe-core/playwright reports 0 violations at WCAG 2.2 AA

Scenario: Axe scan — embed page

Given  I navigate to /embed
Then   0 axe violations

Scenario: Full keyboard navigation

Given  I navigate to /
When   I Tab through the entire page
Then   focus visits: title → description → URL → keyword → fetch button →
       tab list (Desktop/Mobile/Bing/Social) → screenshot button →
       theme toggle → history toggle → bulk panel toggle
And    every focused element has a visible focus ring

Scenario: Score gauge has ARIA attributes

Given  I inspect the overall score gauge element
Then   it has aria-valuenow, aria-valuemin, aria-valuemax attributes

Scenario: Score status is announced

Given  score status changes from good to error
Then   the change is communicated via aria-live or role="status"

Scenario: Contrast ratio ≥ 4.5:1

Given  axe scan runs with contrast rule enabled
Then   zero color-contrast violations
```

### 4.11 `e2e/mobile.spec.ts` — Responsive (NFR)

```
Scenario: 375px mobile viewport

Given  viewport = 375×812 (iPhone 14)
When   I navigate to /
Then   no horizontal scroll bar
And    all inputs are full-width
And    score cards are visible

Scenario: 320px minimum width at /embed

Given  viewport = 320×568
When   I navigate to /embed
Then   no content overflows horizontally
And    no elements are clipped
```

---

## 5. Property-Based Test Candidates

Use **fast-check** (`npm install -D fast-check`) for the following:

### 5.1 `scoreTitle` — Score Always in `[0, 100]`

```typescript
fc.assert(fc.property(fc.string(), (title) => {
  const { score } = scoreTitle(title);
  return score >= 0 && score <= 100;
}));

fc.assert(fc.property(fc.string(), (title) => {
  const { status } = scoreTitle(title);
  return ["good", "warning", "error"].includes(status);
}));
```

### 5.2 `scoreDescription` — Same Properties

```typescript
fc.assert(fc.property(fc.string(), (desc) => {
  const { score, status } = scoreDescription(desc);
  return score >= 0 && score <= 100 && ["good","warning","error"].includes(status);
}));
```

### 5.3 `calculateOverallScore` — Result Always in `[0, 100]`

```typescript
fc.assert(fc.property(
  fc.integer({min:0, max:100}),
  fc.integer({min:0, max:100}),
  fc.integer({min:0, max:100}),
  (t, d, k) => {
    const overall = calculateOverallScore(t, d, k);
    return overall >= 0 && overall <= 100 && Number.isInteger(overall);
  }
));
```

### 5.4 `truncateAtChars` — Output Length Never Exceeds `maxChars + 1`

```typescript
fc.assert(fc.property(
  fc.string(),
  fc.integer({min:1, max:200}),
  (text, max) => {
    const result = truncateAtChars(text, max);
    // At most max chars + 1 ellipsis character
    return result.length <= max + 1;
  }
));

// Output always starts with the first chars of input
fc.assert(fc.property(
  fc.string({minLength:1}),
  fc.integer({min:1, max:200}),
  (text, max) => {
    const result = truncateAtChars(text, max);
    return text.startsWith(result.replace('…', ''));
  }
));
```

### 5.5 `highlightKeyword` — Segments Reconstruct Original Text

```typescript
fc.assert(fc.property(
  fc.string(),
  fc.string(),
  (text, keyword) => {
    const segments = highlightKeyword(text, keyword);
    const reconstructed = segments.map(s => s.text).join('');
    return reconstructed === text;
  }
));
```

### 5.6 `parseCsv` / `exportResultsToCsv` — Row Count Round-trip

```typescript
fc.assert(fc.property(
  fc.array(
    fc.record({
      title: fc.string({maxLength: 100}),
      description: fc.string({maxLength: 200}),
      url: fc.constant('https://example.com'),
      keyword: fc.option(fc.string({maxLength: 30}), {nil: undefined}),
    }),
    {minLength: 1, maxLength: 50}
  ),
  (rows) => {
    const scored = processBulkRows(rows);
    const csv = exportResultsToCsv(scored);
    const lines = csv.trim().split('\n');
    return lines.length === rows.length + 1; // header + data rows
  }
));
```

### 5.7 `generateEmbedCode` / `parseWidgetOptions` — Serialization Round-trip

```typescript
fc.assert(fc.property(
  fc.record({
    showScores:   fc.boolean(),
    showPreviews: fc.boolean(),
    compactMode:  fc.boolean(),
  }),
  (opts) => {
    const code = generateEmbedCode(opts);
    const srcMatch = code.match(/src="([^"]+)"/);
    if (!srcMatch) return false;
    const parsed = parseWidgetOptions(new URL(srcMatch[1]).searchParams);
    if (opts.showScores === false && parsed.showScores !== false) return false;
    if (opts.showPreviews === false && parsed.showPreviews !== false) return false;
    if (opts.compactMode === true && parsed.compactMode !== true) return false;
    return true;
  }
));
```

### 5.8 `formatHistoryDate` — Always Returns Non-Empty String

```typescript
fc.assert(fc.property(
  fc.integer({min: 0, max: Date.now()}),
  (timestamp) => formatHistoryDate(timestamp).length > 0
));
```

---

## 6. Acceptance Criterion → Test Mapping

Every acceptance criterion from SPEC.md §3 maps to at least one test.

| AC ID | Description | Unit test | Integration test | E2E test |
|-------|-------------|-----------|-----------------|---------|
| F001-AC1 | Title char count updates in real-time | — | `MetaInputForm` title change | `main-flow.spec` |
| F001-AC2 | Description char count updates | — | `MetaInputForm` desc change | `main-flow.spec` |
| F001-AC3 | Invalid URL shows validation error | `validateUrl` all cases | `MetaInputForm` url-error | `main-flow.spec` |
| F001-AC4 | Placeholder values on empty load | — | `GoogleDesktopPreview` empty | `main-flow.spec` |
| F001-AC5 | Previews update within 16ms | `useScores` (sync) | — | `scoring.spec` timing |
| F002-AC1 | Title as blue link, correct font | — | `GoogleDesktopPreview` colour | `previews.spec` |
| F002-AC2 | URL as green breadcrumb | `extractDomain`, `formatGoogleBreadcrumb` | `GoogleDesktopPreview` URL | `main-flow.spec` |
| F002-AC3 | Title >60 chars truncated with `…` | `truncateGoogleDesktopTitle` BVT | `GoogleDesktopPreview` | `main-flow.spec` |
| F002-AC4 | Description >160 chars truncated | `truncateGoogleDesktopDescription` BVT | `GoogleDesktopPreview` | `previews.spec` |
| F002-AC5 | Keyword bolded in preview | `highlightKeyword` all cases | `GoogleDesktopPreview` bold span | `main-flow.spec` |
| F003-AC1 | Mobile title truncates at ~50 | `truncateGoogleMobileTitle` BVT | `GoogleMobilePreview` | `main-flow.spec` |
| F003-AC2 | Mobile description truncates at ~120 | `truncateGoogleMobileDescription` BVT | `GoogleMobilePreview` | `previews.spec` |
| F003-AC3 | Mobile 360px container | — | `GoogleMobilePreview` CSS | `mobile.spec` |
| F003-AC4 | Mobile font sizes match spec | — | `GoogleMobilePreview` style | `previews.spec` |
| F004-AC1 | Title score green/yellow/red with feedback | `scoreTitle` BVT | `ScoreDashboard` badge colours | `scoring.spec` |
| F004-AC2 | Description score green/yellow/red | `scoreDescription` BVT | `ScoreDashboard` | `scoring.spec` |
| F004-AC3 | Keyword presence score | `scoreKeywordPresence` all cases | `ScoreDashboard` keyword card | `scoring.spec` |
| F004-AC4 | Mobile truncation warning | `checkMobileTruncation` BVT | `MobileTruncationWarning` | `main-flow.spec` |
| F004-AC5 | Overall = weighted avg 40/40/20 | `calculateOverallScore` all cases | `OverallScoreGauge` | `scoring.spec` |
| F005-AC1 | Bing styling: Segoe UI, diff blue, diff URL | — | `BingPreview` colour/font | `previews.spec` |
| F005-AC2 | Bing title truncates at 65 | `truncateBingTitle` BVT | `BingPreview` | `previews.spec` |
| F005-AC3 | Bing description truncates at ~160 | `truncateBingDescription` BVT | `BingPreview` | `previews.spec` |
| F006-AC1 | Social card shows title/desc/domain | — | `SocialCardPreview` | `main-flow.spec` |
| F006-AC2 | No OG image → placeholder with dimensions | — | `SocialCardPreview` no-image | `main-flow.spec` |
| F006-AC3 | OG image URL → image loads; error → placeholder | — | `SocialCardPreview` with-image | `previews.spec` |
| F006-AC4 | Facebook/LinkedIn card format (order) | — | `SocialCardPreview` DOM order | `previews.spec` |
| F007-AC1 | PNG download on click | `captureAndDownload` mock | `ScreenshotButton` | `screenshot.spec` |
| F007-AC2 | Only preview area captured | element ref check | — | `screenshot.spec` visual |
| F007-AC3 | Watermark at bottom of image | `addWatermark` geometry | `ScreenshotButton` | `screenshot.spec` |
| F007-AC4 | Spinner shows; completes within 2s | — | `ScreenshotButton` loading state | `screenshot.spec` |
| F008-AC1 | Embed code snippet copyable | `generateEmbedCode` | `EmbedCodeGenerator` | `embed.spec` |
| F008-AC2 | iframe renders tool at /embed | `parseWidgetOptions` | `WidgetWrapper` | `embed.spec` |
| F008-AC3 | "Powered by" link in widget | — | — | `embed.spec` /embed page |
| F008-AC4 | Responsive: min 320px, max 100% | `generateEmbedCode` style check | — | `embed.spec`, `mobile.spec` |
| F008-AC5 | Widget previews+scores identical to main | — | `WidgetWrapper` renders | `embed.spec` |
| F009-AC1 | System dark pref → dark mode on load | `useTheme` matchMedia | — | `dark-mode.spec` |
| F009-AC2 | Toggle switches theme within 100ms | `useTheme` toggle | — | `dark-mode.spec` |
| F009-AC3 | SERP previews always in light theme | — | Preview components in dark ctx | `dark-mode.spec` |
| F009-AC4 | Theme persists via localStorage | `useTheme` storage | — | `dark-mode.spec` |
| F010-AC1 | Last 20 checks listed w/ title+score+time | `saveHistoryEntry`, `readHistory` | `HistoryPanel` | `history.spec` |
| F010-AC2 | Click entry repopulates form | — | `HistoryPanel` onSelect | `history.spec` |
| F010-AC3 | Uses localStorage (no server) | all history fns | `useHistory` hook | `history.spec` |
| F010-AC4 | Graceful degradation when localStorage fails | error cases in all history fns | `HistoryPanel` no-storage | `history.spec` |
| F011-AC1 | CSV rows scored and shown in table | `parseCsv`, `scoreBulkRow`, `processBulkRows` | `BulkCheckPanel` | `bulk.spec` |
| F011-AC2 | 500 rows in < 5 seconds | `processBulkRows` perf test | `BulkCheckPanel` | `bulk.spec` |
| F011-AC3 | Export CSV downloads with scores | `exportResultsToCsv`, `downloadCsv` | `BulkCheckPanel` export btn | `bulk.spec` |
| F012-AC1 | URL fetch populates title+desc+OG fields | `fetch-meta` route happy paths | `UrlFetchButton` | `url-fetch.spec` |
| F012-AC2 | Spinner shown during fetch | — | `UrlFetchButton` loading state | `url-fetch.spec` |
| F012-AC3 | Error shown on CORS/timeout/failure | `fetch-meta` route error paths | `UrlFetchButton` error | `url-fetch.spec` |

---

## 7. Per-Module Coverage Targets

| Module | Line % | Branch % | Rationale |
|--------|--------|----------|-----------|
| `src/lib/scoring.ts` | **100%** | **100%** | Core business logic; pure functions; all branches reachable |
| `src/lib/truncation.ts` | **100%** | **100%** | Pure string logic; SERP accuracy is safety-critical |
| `src/lib/history.ts` | **95%** | **90%** | `localStorage` catch blocks tested; minor defensive combos low-value |
| `src/lib/bulk.ts` | **95%** | **95%** | CSV parsing is complex; all quoted-field paths required |
| `src/lib/embed.ts` | **100%** | **100%** | Simple pure functions; full coverage is trivial |
| `src/lib/screenshot.ts` | **80%** | **75%** | Dynamic import + canvas I/O limits testability |
| `src/lib/utils.ts` | **90%** | **85%** | Defensive null checks in minor utilities are low-value |
| `src/lib/hooks/useMetaInput.ts` | **90%** | **85%** | Tested via `renderHook` |
| `src/lib/hooks/useScores.ts` | **95%** | **90%** | Derived-state; nearly pure |
| `src/lib/hooks/useTheme.ts` | **90%** | **85%** | DOM side-effects, matchMedia mocking |
| `src/lib/hooks/useHistory.ts` | **90%** | **85%** | localStorage error branches |
| `src/components/input/**` | **85%** | **80%** | UI behaviour |
| `src/components/preview/**` | **85%** | **80%** | Rendering + truncation |
| `src/components/scoring/**` | **85%** | **80%** | Score display logic |
| `src/components/export/**` | **80%** | **75%** | html2canvas dependency limits |
| `src/components/history/**` | **80%** | **75%** | localStorage + interaction |
| `src/components/bulk/**` | **80%** | **75%** | File upload mocking complexity |
| `src/components/embed/**` | **85%** | **80%** | Code generation + clipboard |
| `src/app/api/fetch-meta/route.ts` | **95%** | **90%** | All error branches + happy paths |
| `src/app/api/og/route.ts` | **70%** | **60%** | `ImageResponse` is not easily introspectable |
| **Overall project** | **≥ 85%** | **≥ 80%** | Vitest coverage gate in CI |

---

## 8. Non-Functional Test Coverage

### Performance

| Test | Method | Threshold |
|------|--------|-----------|
| First-load JS bundle < 80KB gzipped | Parse `.next/build-manifest.json` in CI | < 80 KB |
| html2canvas NOT in first-load bundle | Chunk analysis via `next build` output | Not in first chunk |
| Input-to-render latency < 16ms | Playwright: `performance.mark` around type → DOM update | < 16 ms |
| Lighthouse Performance ≥ 95 | `@lhci/cli` against production URL | ≥ 95 |
| FCP < 1.5s on simulated 3G | Playwright `throttleDownload` / Lighthouse | < 1500 ms |
| 500-row bulk scoring < 5s | `processBulkRows` unit perf test | < 5000 ms |

### Security

| Check | How |
|-------|-----|
| `X-Frame-Options: DENY` on `/` | E2E header assertion + API route test |
| `/embed` has no `X-Frame-Options: DENY` | E2E header assertion |
| `X-Content-Type-Options: nosniff` everywhere | API integration tests |
| No `dangerouslySetInnerHTML` | `grep -r dangerouslySetInnerHTML src/` in CI (should return 0 lines) |
| XSS: title `<script>alert(1)</script>` renders as text | E2E: type payload → verify no alert, rendered as literal text |
| Keyword regex chars (`c++`, `(java)`, `[test]`) don't throw | `highlightKeyword` unit tests |
| API rejects non-http/https protocols | `fetch-meta` route integration tests |
| `javascript:` URI rejected | `validateUrl` unit + `fetch-meta` route test |

### Accessibility (WCAG 2.2 Level AA)

| Test | Tool |
|------|------|
| Zero axe violations on all pages | `@axe-core/playwright` in `accessibility.spec.ts` |
| Colour contrast ≥ 4.5:1 | axe rule `color-contrast` |
| All inputs have labels | axe rule `label` |
| Focus visible on all interactive elements | Manual Playwright keyboard nav |
| Score gauge has ARIA value attributes | component unit test |
| Score status announced via `aria-live` or `role="status"` | component unit test |

---

## 9. Test Fixtures

Extend `src/test/fixtures/meta-samples.ts` with the following:

```typescript
// Boundary-value title fixtures (maps to SCORING.title thresholds)
export const TITLES = {
  empty:       "",
  tooShort:    "Short",             // 5 chars
  boundary9:   "123456789",         // 9 chars (error)
  boundary10:  "1234567890",        // 10 chars (good start)
  optimal30:   "A".repeat(30),
  optimal45:   "A".repeat(45),
  boundary60:  "A".repeat(60),      // good end
  warning61:   "A".repeat(61),      // warning start
  warning70:   "A".repeat(70),      // warning end
  error71:     "A".repeat(71),      // error start
  tooLong200:  "A".repeat(200),
};

// Boundary-value description fixtures (maps to SCORING.description thresholds)
export const DESCRIPTIONS = {
  empty:       "",
  tooShort:    "Short desc",
  boundary119: "A".repeat(119),     // warning end
  boundary120: "A".repeat(120),     // good start
  boundary160: "A".repeat(160),     // good end
  warning161:  "A".repeat(161),     // warning start
  warning200:  "A".repeat(200),     // warning end
  error201:    "A".repeat(201),     // error start
  tooLong500:  "A".repeat(500),
};

// URL fixtures
export const URLS = {
  empty:      "",
  valid:      "https://example.com",
  withPath:   "https://example.com/blog/my-post",
  withQuery:  "https://example.com/search?q=seo&page=2",
  http:       "http://example.com",
  invalid:    "not a url",
  ftp:        "ftp://example.com",
  javascript: "javascript:alert(1)",
  dataUri:    "data:text/html,<h1>hi</h1>",
};

// Keyword fixtures
export const KEYWORDS = {
  empty:      "",
  single:     "SEO",
  multiWord:  "SEO tips",
  withPlus:   "c++",
  withParens: "(java)",
  withBracket:"[regex]",
  unicode:    "référencement",
};

// Complete good metadata (all green scores expected)
export const FULL_META_GOOD = {
  title:       "10 Best SEO Tips for Content Creators in 2024",  // 47 chars
  description: "Discover the top SEO strategies that will help you rank higher in search results, drive more organic traffic, and grow your audience in 2024.", // 145 chars
  url:         "https://example.com/blog/seo-tips-2024",
  keyword:     "SEO tips",
};

// Complete bad metadata (all red scores expected)
export const FULL_META_BAD = {
  title:       "A",
  description: "Short",
  url:         "bad-url",
  keyword:     "blockchain",
};

// CSV string fixtures for bulk tests
export const CSV = {
  minimal:        `title\nMy Page Title`,
  noTitleColumn:  `foo,bar\n1,2`,
  fullHeader:     `title,description,url,keyword`,
  validFiveRows:  [
    "title,description,url,keyword",
    ...Array(5).fill(
      `${TITLES.optimal45},${"A".repeat(145)},https://example.com,SEO tips`
    )
  ].join("\n"),
  quotedFields:   `title,description\n"Hello, World","He said ""hi"""`,
  crlfLineEndings: `title,description\r\nPost 1,Desc 1\r\nPost 2,Desc 2`,
  fiveHundredRows: [
    "title,description,url,keyword",
    ...Array(500).fill(
      `${TITLES.optimal45},${"A".repeat(145)},https://example.com,SEO`
    )
  ].join("\n"),
};

// HTML strings for fetch-meta route tests
export const HTML = {
  withAllMeta: `<html><head>
    <title>My Page Title</title>
    <meta name="description" content="My page description">
    <meta property="og:title" content="OG Title">
    <meta property="og:description" content="OG Description">
    <meta property="og:image" content="https://example.com/image.jpg">
  </head></html>`,
  empty:       `<html><head></head><body></body></html>`,
  withEntities:`<html><head><title>A &amp; B &quot;quoted&quot;</title></head></html>`,
  reversedAttrs: `<html><head>
    <meta content="Reversed Desc" name="description">
  </head></html>`,
};
```

---

## 10. Mock Strategy

| Dependency | Strategy | Affected test files |
|-----------|---------|---------------------|
| `localStorage` | `vitest-localstorage-mock` in `src/test/setup.ts` | `history.test.ts`, `useHistory.test.ts`, `useTheme.test.ts`, `HistoryPanel.test.tsx` |
| `window.matchMedia` | `vi.stubGlobal('matchMedia', fn)` in setup | `useTheme.test.ts` |
| `html2canvas` | `vi.mock('html2canvas', () => ({default: vi.fn().mockResolvedValue(mockCanvas)}))` | `screenshot.test.ts`, `ScreenshotButton.test.tsx` |
| `URL.createObjectURL` | `vi.stubGlobal('URL', {...URL, createObjectURL: vi.fn(() => 'blob:…'), revokeObjectURL: vi.fn()})` | `bulk.test.ts`, `screenshot.test.ts` |
| `navigator.clipboard` | `vi.stubGlobal('navigator', {clipboard: {writeText: vi.fn().mockResolvedValue(undefined)}})` | `EmbedCodeGenerator.test.tsx` |
| `global.fetch` (API routes) | `vi.stubGlobal('fetch', vi.fn())` — configured per test | `fetch-meta/route.test.ts` |
| `/api/fetch-meta` (E2E) | `page.route('/api/fetch-meta**', handler)` | `url-fetch.spec.ts` |
| System time | `vi.useFakeTimers(); vi.setSystemTime(new Date(...))` | `history.test.ts` (formatHistoryDate) |
| `FileReader` | Mock class in `BulkCheckPanel.test.tsx` via `Object.defineProperty` | `BulkCheckPanel.test.tsx` |
| `prefers-color-scheme` (E2E) | `page.emulateMedia({colorScheme: 'dark'})` | `dark-mode.spec.ts` |

---

## 11. `data-testid` Attribute Checklist

All interactive and observable elements need `data-testid` before E2E tests run. Required additions:

```
Input Form
  ✅ data-testid="title-input"
  ✅ data-testid="description-input"
  ✅ data-testid="url-input"
  ✅ data-testid="keyword-input"
  🆕 data-testid="title-char-count"
  🆕 data-testid="description-char-count"
  🆕 data-testid="url-error"
  🆕 data-testid="url-fetch-button"
  🆕 data-testid="fetch-spinner"
  🆕 data-testid="fetch-error"

Preview Tabs
  🆕 data-testid="tab-google-desktop"
  🆕 data-testid="tab-google-mobile"
  🆕 data-testid="tab-bing"
  🆕 data-testid="tab-social"

Preview Content
  🆕 data-testid="google-desktop-preview"
  🆕 data-testid="google-title"
  🆕 data-testid="google-url"
  🆕 data-testid="google-description"
  🆕 data-testid="google-mobile-preview"
  🆕 data-testid="google-mobile-title"
  🆕 data-testid="google-mobile-description"
  🆕 data-testid="bing-preview"
  🆕 data-testid="bing-title"
  🆕 data-testid="bing-url"
  🆕 data-testid="bing-description"
  🆕 data-testid="social-card-preview"
  🆕 data-testid="og-image"
  🆕 data-testid="og-image-placeholder"
  🆕 data-testid="og-title"
  🆕 data-testid="og-description"
  🆕 data-testid="og-domain"

Scoring
  🆕 data-testid="score-dashboard"
  🆕 data-testid="overall-score"
  🆕 data-testid="title-score-card"
  🆕 data-testid="description-score-card"
  🆕 data-testid="keyword-score-card"
  🆕 data-testid="mobile-truncation-warning"

Export
  🆕 data-testid="screenshot-button"
  🆕 data-testid="screenshot-spinner"

Theme
  🆕 data-testid="theme-toggle"

History
  🆕 data-testid="history-toggle"
  🆕 data-testid="history-panel"
  🆕 data-testid="history-entry"         (repeating element)
  🆕 data-testid="history-entry-title"   (repeating element)
  🆕 data-testid="history-entry-score"   (repeating element)
  🆕 data-testid="history-entry-time"    (repeating element)
  🆕 data-testid="history-entry-delete"  (repeating element)
  🆕 data-testid="history-clear-all"

Bulk Check
  🆕 data-testid="bulk-panel"
  🆕 data-testid="csv-file-input"
  🆕 data-testid="bulk-results-table"
  🆕 data-testid="bulk-export-button"
  🆕 data-testid="bulk-error"

Embed
  🆕 data-testid="embed-code-output"
  🆕 data-testid="copy-button"
  🆕 data-testid="compact-toggle"
  🆕 data-testid="show-scores-toggle"
  🆕 data-testid="show-previews-toggle"
  🆕 data-testid="powered-by-link"       (on /embed page)
```

---

*All 36 acceptance criteria from SPEC.md §3 (F001–F012) map to at least one test in sections 2–4. See §6 for the complete traceability matrix.*
