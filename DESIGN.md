# DESIGN.md — SEO Meta Preview & Scorer

## UI/UX Design Specification

> **Stack:** Next.js 16 · React 19 · Tailwind CSS 4.0 · shadcn/ui · Geist fonts
> **Compliance target:** WCAG 2.2 AA
> **Last updated:** 2026-03-19

---

## Table of Contents

1. [Design Principles & Visual Style](#1-design-principles--visual-style)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [User Flows](#5-user-flows)
6. [Page Layouts](#6-page-layouts)
7. [Component Specifications](#7-component-specifications)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Loading, Empty & Error States](#10-loading-empty--error-states)

---

## 1. Design Principles & Visual Style

### Core Principles

| Principle                   | Description                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Instant Feedback**        | Every keystroke triggers a live score update and preview refresh — zero latency between input and output.                                                                       |
| **Pixel Credibility**       | The Google and Bing previews must be visually indistinguishable from their real counterparts. Color, font, truncation, and favicon placement must match exactly.                |
| **Progressive Disclosure**  | Show the most critical information (overall score, primary preview) first. Advanced controls (OG tags, widget embed, export) live behind a secondary interaction.               |
| **Clarity Over Decoration** | The interface is a professional tool, not a marketing page. Whitespace and hierarchy carry the design; no gradients, shadows, or decorative elements beyond structural purpose. |
| **Accessible by Default**   | Every score state is communicated through color _and_ text _and_ icon — never color alone.                                                                                      |

### Visual Style

- **Tone:** Clean, professional, data-forward. Similar to developer tooling (Vercel dashboard, Linear, Radix docs).
- **Density:** Medium. Comfortable for extended editing sessions, not cramped.
- **Motion:** Micro-interactions only — score bar transitions (`transition-all duration-300 ease-out`), tab switches (`transition-opacity duration-150`). No decorative animations.
- **Shadows:** Minimal. `shadow-sm` on cards; no `shadow-xl` or `drop-shadow` flourishes.
- **Radius:** `0.5rem` (8px) globally via `--radius`. Inputs: `rounded-lg`. Badges: `rounded-full`.
- **Theme:** Light and dark mode supported. Toggle available in the navbar. Default follows OS preference via `prefers-color-scheme`.

---

## 2. Color Palette

### Semantic Tokens (CSS variables → globals.css)

These map to the shadcn/ui token system and Tailwind's extended theme.

| Token                    | Light Mode (HSL) | Light Mode (Hex) | Dark Mode (HSL) | Dark Mode (Hex) |
| ------------------------ | ---------------- | ---------------- | --------------- | --------------- |
| `--background`           | `0 0% 100%`      | `#FFFFFF`        | `0 0% 3.6%`     | `#090909`       |
| `--foreground`           | `0 0% 3.6%`      | `#090909`        | `0 0% 98%`      | `#FAFAFA`       |
| `--card`                 | `0 0% 100%`      | `#FFFFFF`        | `0 0% 3.6%`     | `#090909`       |
| `--card-foreground`      | `0 0% 3.6%`      | `#090909`        | `0 0% 98%`      | `#FAFAFA`       |
| `--muted`                | `0 0% 96.1%`     | `#F5F5F5`        | `0 0% 14.9%`    | `#262626`       |
| `--muted-foreground`     | `0 0% 45.1%`     | `#737373`        | `0 0% 63.9%`    | `#A3A3A3`       |
| `--primary`              | `0 0% 9%`        | `#171717`        | `0 0% 98%`      | `#FAFAFA`       |
| `--primary-foreground`   | `0 0% 98%`       | `#FAFAFA`        | `0 0% 9%`       | `#171717`       |
| `--secondary`            | `0 0% 96.1%`     | `#F5F5F5`        | `0 0% 14.9%`    | `#262626`       |
| `--secondary-foreground` | `0 0% 9%`        | `#171717`        | `0 0% 98%`      | `#FAFAFA`       |
| `--border`               | `0 0% 89.8%`     | `#E5E5E5`        | `0 0% 14.9%`    | `#262626`       |
| `--input`                | `0 0% 89.8%`     | `#E5E5E5`        | `0 0% 14.9%`    | `#262626`       |
| `--ring`                 | `0 0% 3.6%`      | `#090909`        | `0 0% 83.3%`    | `#D4D4D4`       |
| `--destructive`          | `0 84.2% 60.2%`  | `#EF4444`        | `0 84.2% 60.2%` | `#EF4444`       |
| `--accent`               | `0 0% 9%`        | `#171717`        | `0 0% 98%`      | `#FAFAFA`       |

### Semantic Score Colors (Tailwind slate/green/yellow/red)

These are applied in the scoring logic and progress bars:

| Status            | Tailwind Class                  | Light Hex             | Dark Variant                    |
| ----------------- | ------------------------------- | --------------------- | ------------------------------- |
| `good`            | `bg-green-500`                  | `#22C55E`             | same                            |
| `good` (badge)    | `bg-green-100 text-green-800`   | `#DCFCE7` / `#166534` | `bg-green-900 text-green-200`   |
| `warning`         | `bg-yellow-500`                 | `#EAB308`             | same                            |
| `warning` (badge) | `bg-yellow-100 text-yellow-800` | `#FEF9C3` / `#854D0E` | `bg-yellow-900 text-yellow-200` |
| `error`           | `bg-red-500`                    | `#EF4444`             | same                            |
| `error` (badge)   | `bg-red-100 text-red-800`       | `#FEE2E2` / `#991B1B` | `bg-red-900 text-red-200`       |

### Page Background

```
Light: bg-gradient-to-br from-slate-50 to-slate-100   (#F8FAFC → #F1F5F9)
Dark:  bg-gradient-to-br from-slate-950 to-slate-900  (#020617 → #0F172A)
```

### Google Preview Exact Colors

These are hardcoded in the `GooglePreview` component to match real SERP.

| Element             | Color                                                           |
| ------------------- | --------------------------------------------------------------- |
| URL / breadcrumb    | `#202124` (dark) · `#1A0DAB` (link blue — not used in URL chip) |
| URL green chip      | `#006621`                                                       |
| Title link          | `#1A0DAB`                                                       |
| Description text    | `#4D5156`                                                       |
| Favicon placeholder | `#E8EAED` background                                            |

### Bing Preview Exact Colors

| Element          | Color     |
| ---------------- | --------- |
| Title link       | `#001B9A` |
| URL text         | `#006400` |
| Description text | `#767676` |

---

## 3. Typography

### Font Families

| Role                           | Font       | Variable            | Tailwind Class |
| ------------------------------ | ---------- | ------------------- | -------------- |
| UI / Body / Headings           | Geist Sans | `--font-geist-sans` | `font-sans`    |
| Code / Monospace / URL display | Geist Mono | `--font-geist-mono` | `font-mono`    |

Both loaded via `next/font/google` in `layout.tsx` with `latin` subset, no layout shift.

### Type Scale

| Style         | Size                 | Weight                | Line Height       | Usage                    |
| ------------- | -------------------- | --------------------- | ----------------- | ------------------------ |
| `display`     | `text-5xl` (3rem)    | `font-bold` (700)     | `leading-tight`   | Page title (desktop)     |
| `display-sm`  | `text-4xl` (2.25rem) | `font-bold` (700)     | `leading-tight`   | Page title (mobile)      |
| `h2`          | `text-xl` (1.25rem)  | `font-semibold` (600) | `leading-snug`    | Section headings         |
| `h3`          | `text-base` (1rem)   | `font-semibold` (600) | `leading-normal`  | Card sub-headings        |
| `body`        | `text-sm` (0.875rem) | `font-normal` (400)   | `leading-relaxed` | Body copy, descriptions  |
| `label`       | `text-sm` (0.875rem) | `font-medium` (500)   | `leading-none`    | Form labels              |
| `caption`     | `text-xs` (0.75rem)  | `font-normal` (400)   | `leading-normal`  | Score messages, hints    |
| `mono`        | `text-xs` (0.75rem)  | `font-normal` (400)   | `leading-normal`  | URL display, char counts |
| `score-badge` | `text-5xl` (3rem)    | `font-bold` (700)     | `leading-none`    | Overall score number     |

### Google SERP Typography (Hardcoded in component)

| Element     | Font                | Size   | Weight |
| ----------- | ------------------- | ------ | ------ |
| Title       | `Arial, sans-serif` | `20px` | `400`  |
| URL         | `Arial, sans-serif` | `14px` | `400`  |
| Description | `Arial, sans-serif` | `14px` | `400`  |

### Bing Preview Typography (Hardcoded in component)

| Element     | Font                            | Size   | Weight |
| ----------- | ------------------------------- | ------ | ------ |
| Title       | `'Segoe UI', Arial, sans-serif` | `19px` | `400`  |
| URL         | `'Segoe UI', Arial, sans-serif` | `13px` | `400`  |
| Description | `'Segoe UI', Arial, sans-serif` | `13px` | `400`  |

---

## 4. Spacing System

All spacing uses Tailwind's default 4px-base scale.

| Token      | Value | Common Use                 |
| ---------- | ----- | -------------------------- |
| `space-1`  | 4px   | Icon gaps                  |
| `space-2`  | 8px   | Inline gaps, badge padding |
| `space-3`  | 12px  | Dense row gaps             |
| `space-4`  | 16px  | Input padding, list items  |
| `space-6`  | 24px  | Card padding (mobile)      |
| `space-8`  | 32px  | Section gaps               |
| `space-12` | 48px  | Page top padding (desktop) |
| `space-16` | 64px  | Footer margin              |

### Container

```
max-w-screen-xl (1280px) with px-4 (mobile) → px-6 (md) → px-8 (lg)
centered via mx-auto
```

### Card Padding

```
p-6 (24px all sides) on desktop
p-4 (16px all sides) on mobile (< sm breakpoint)
```

### Form Field Stack Gap

```
space-y-4 (16px) between form fields within a section
space-y-6 (24px) between major sections
space-y-8 (32px) between page-level blocks
```

---

## 5. User Flows

### Flow 1: First-Time User — Scoring & Previewing

```
1. Land on / (Home page)
   └─ See pre-filled example values in the form
   └─ Overall score badge is visible immediately (no empty state)
   └─ Google SERP preview renders with example data

2. Edit "Page Title" textarea
   └─ Character counter updates instantly (e.g., "43 chars")
   └─ Progress bar animates (green/yellow/red) in real time
   └─ Score message updates below the bar
   └─ Google SERP preview title updates live

3. Edit "Meta Description" textarea
   └─ Same real-time feedback loop as title
   └─ Preview description text updates live

4. Edit "URL" input
   └─ URL validated on change (no debounce)
   └─ Red error text appears if invalid format
   └─ Domain + breadcrumb in Google preview updates

5. Edit "Primary Keyword" input
   └─ Keyword presence score recalculates
   └─ Matching text in preview is NOT highlighted (plain SERP look)

6. View Overall Score card
   └─ Score number and bar reflect weighted composite (40/40/20)
   └─ Color shifts: green ≥80, yellow 50–79, red <50

7. Click preview tab (Google → Bing → Social Card → Mobile)
   └─ Active tab switches preview engine
   └─ All previews always receive the same live data

8. Done — user copies/shares/exports
```

### Flow 2: Export as Screenshot

```
1. User has filled in metadata and is happy with the preview

2. Click "Export PNG" or "Export JPG" button (in preview header toolbar)
   └─ Button shows loading spinner (html2canvas is rendering)
   └─ Button is disabled during processing

3. html2canvas captures the active preview card (not the whole page)
   └─ Download dialog opens automatically
   └─ File named: seo-preview-{timestamp}.png (or .jpg)

4. Button returns to default state
   └─ Success toast notification: "Preview exported successfully"
```

### Flow 3: Copy Shareable Link

```
1. Click "Share" button (Lucide `Share2` icon, in the header toolbar)

2. App serializes current metadata into URL search params:
   ?title=...&description=...&url=...&keyword=...
   (values URL-encoded, max ~2000 chars)

3. URL is copied to clipboard via navigator.clipboard.writeText()

4. Button swaps to a checkmark icon for 2 seconds
   └─ Tooltip text: "Link copied!"

5. Anyone with the link lands on the pre-filled form state
```

### Flow 4: Generate Embed Widget Code

```
1. Click "Embed" button in the header toolbar
   └─ Opens a shadcn/ui Dialog (modal)

2. Dialog shows widget configuration options:
   - Toggle: Show scores (default: on)
   - Toggle: Show previews (default: on)
   - Toggle: Compact mode (default: off)
   - Text fields: Default title / description / URL (pre-filled)

3. Live iframe embed code is shown in a syntax-highlighted code block
   └─ <iframe src="https://.../?widget=1&embedId=...&..." ...>

4. "Copy Code" button → clipboard copy → button shows checkmark

5. "Close" or Escape dismisses the modal
```

### Flow 5: Toggle Dark Mode

```
1. Click moon/sun icon button in the top-right of the navbar

2. HTML class `dark` is toggled on <html> element
   └─ All CSS variable tokens switch immediately (no flicker)
   └─ User preference persisted to localStorage key: "seo-theme"

3. On next page load, theme is read from localStorage before paint
   └─ Implemented via inline script in <head> to prevent FOUC
```

### Flow 6: Mobile Truncation Warning

```
1. User types a title longer than 50 chars OR description longer than 120 chars

2. A yellow warning banner appears below the field:
   "⚠ This will be truncated on mobile devices"

3. In the "Mobile" preview tab, the text is shown with an ellipsis at the
   truncation point, and a red dashed underline after the cut-off character

4. Warning disappears immediately when chars drop below threshold
```

---

## 6. Page Layouts

### Route: `/` — Main Application

This is a **single-route application**. All functionality lives on one page.

#### Mobile Layout (< 640px)

```
┌─────────────────────────────┐
│  [Logo]   SEO Meta Preview  │  ← Navbar: h-14, px-4
│                      [🌙]   │
├─────────────────────────────┤
│  SEO Meta Preview           │  ← h1, text-4xl, font-bold
│  & Scorer                   │
│  See exactly how your...    │  ← p, text-base, text-slate-600
├─────────────────────────────┤
│ ╔═══════════════════════╗   │
│ ║  Enter Page Info       ║   │  ← Card, p-4
│ ║  ─────────────────    ║   │
│ ║  [Page Title ▼ 43c]  ║   │
│ ║  ████████░░ 100%      ║   │  ← Progress bar
│ ║  Perfect length       ║   │
│ ║                       ║   │
│ ║  [Meta Description ▼] ║   │
│ ║  ███████░░░ 60%       ║   │
│ ║  Too short...         ║   │
│ ║                       ║   │
│ ║  [URL             ]   ║   │
│ ║  [Primary Keyword ]   ║   │
│ ╚═══════════════════════╝   │
│                             │
│ ╔═══════════════════════╗   │
│ ║  Overall SEO Score    ║   │
│ ║         72            ║   │  ← text-5xl, font-bold, colored
│ ║        /100           ║   │
│ ║  ████████░░░          ║   │  ← h-4 progress bar
│ ╚═══════════════════════╝   │
│                             │
│ ╔═══════════════════════╗   │
│ ║  Preview  [📸][🔗][<>]║   │  ← Card header with action buttons
│ ║  [Google][Bing][OG][📱]║  │  ← Tab list, scrollable
│ ║  ─────────────────    ║   │
│ ║  [Google SERP card]   ║   │
│ ╚═══════════════════════╝   │
│                             │
│ ─────────────────────────── │  ← Footer divider
│   Built with ❤️ for SEO     │
│   Zero API calls · client   │
└─────────────────────────────┘
```

#### Tablet Layout (640px–1023px)

```
┌────────────────────────────────────────────┐
│  [Logo] SEO Meta Preview & Scorer  [🌙]    │  ← Navbar h-16, px-6
├────────────────────────────────────────────┤
│  SEO Meta Preview & Scorer                  │  ← h1, text-4xl
│  See exactly how your pages appear...       │
├────────────────────────────────────────────┤
│ ╔══════════════════════════════════════╗   │
│ ║  Enter Your Page Information         ║   │  ← Card, p-6
│ ║                                      ║   │
│ ║  Page Title                (43 chars)║   │
│ ║  [                                  ]║   │
│ ║  ████████████░░░░░░  100%            ║   │
│ ║  Perfect length (43 chars)           ║   │
│ ║                                      ║   │
│ ║  Meta Description        (89 chars)  ║   │
│ ║  [                                  ]║   │
│ ║  [                                  ]║   │
│ ║  ██████░░░░░░░░░░░░   60%            ║   │
│ ║  Too short...                        ║   │
│ ║                                      ║   │
│ ║  [URL                             ]  ║   │
│ ║  [Primary Keyword (optional)      ]  ║   │
│ ╚══════════════════════════════════════╝   │
│                                            │
│ ╔══════════════════════════════════════╗   │
│ ║  Overall SEO Score          72 /100  ║   │
│ ║  ████████████████████░░░░░░          ║   │
│ ╚══════════════════════════════════════╝   │
│                                            │
│ ╔══════════════════════════════════════╗   │
│ ║  Preview   [Export PNG][Share][Embed]║   │
│ ║  [Google SERP][Bing][Social][Mobile] ║   │
│ ║  ─────────────────────────────────   ║   │
│ ║  [                                 ] ║   │
│ ║  [  Google SERP Preview Card       ] ║   │
│ ║  [                                 ] ║   │
│ ╚══════════════════════════════════════╝   │
└────────────────────────────────────────────┘
```

#### Desktop Layout (≥ 1024px) — Two-Column Split

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  SEO Meta Preview & Scorer             [🌙] [Share] [?] │  ← Navbar h-16
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SEO Meta Preview & Scorer                                        │  ← h1, text-5xl
│  See exactly how your pages appear in Google, Bing, and social.   │
│                                                                   │
├─────────────────────────────────┬───────────────────────────────┤
│  LEFT COLUMN (40%)              │  RIGHT COLUMN (60%)            │
│  max-w-md                       │  flex-1                        │
│                                 │                                │
│ ╔════════════════════════╗      │ ╔══════════════════════════╗  │
│ ║  Enter Page Info       ║      │ ║  Overall SEO Score   72  ║  │
│ ║  ──────────────────    ║      │ ║  /100  ████████████░░░   ║  │
│ ║                        ║      │ ╚══════════════════════════╝  │
│ ║  Page Title    43/60   ║      │                                │
│ ║  [                   ] ║      │ ╔══════════════════════════╗  │
│ ║  [                   ] ║      │ ║  Preview  [📸][🔗][</>]  ║  │
│ ║  ████████░░  100%      ║      │ ║  ┌──────┬────┬────┬────┐ ║  │
│ ║  Perfect length        ║      │ ║  │Google│Bing│ OG │ 📱 │ ║  │
│ ║                        ║      │ ║  └──────┴────┴────┴────┘ ║  │
│ ║  Description  115/160  ║      │ ║  ─────────────────────   ║  │
│ ║  [                   ] ║      │ ║                           ║  │
│ ║  [                   ] ║      │ ║   favicon  example.com   ║  │
│ ║  [                   ] ║      │ ║   > sample-page           ║  │
│ ║  ███████░░   60%       ║      │ ║                           ║  │
│ ║  Too short...          ║      │ ║   Example Page Title |    ║  │
│ ║                        ║      │ ║   My Website              ║  │
│ ║  URL                   ║      │ ║                           ║  │
│ ║  [                   ] ║      │ ║   This is an example meta ║  │
│ ║                        ║      │ ║   description that helps  ║  │
│ ║  Primary Keyword       ║      │ ║   visitors understand...  ║  │
│ ║  [                   ] ║      │ ║                           ║  │
│ ║  ██░░░░░    0%         ║      │ ╚══════════════════════════╝  │
│ ║  Enter keyword...      ║      │                                │
│ ╚════════════════════════╝      └───────────────────────────────┤
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  ── Built with ❤️ for content creators · Zero API · client-side ─│
└─────────────────────────────────────────────────────────────────┘
```

### Route: `/widget` — Embeddable Widget Mode

When `?widget=1` is present in the URL, the layout renders in stripped-down mode:

- No navbar, no footer
- No export/share/embed buttons
- Compact padding: `p-3`
- Optional `?showScores=false` hides score section
- Optional `?compactMode=true` reduces preview to 320px wide
- White background only (no gradient), suitable for iframe embedding
- `X-Frame-Options: SAMEORIGIN` removed for this route only

---

## 7. Component Specifications

### 7.1 `Navbar`

**shadcn/ui reference:** Custom — no direct equivalent. Uses `Button` and `Tooltip`.

```
<nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
  <div className="container mx-auto flex h-16 items-center justify-between px-4">
    <div className="flex items-center gap-2">
      <SearchIcon className="h-5 w-5 text-primary" />
      <span className="font-semibold text-sm hidden sm:inline">SEO Meta Preview</span>
    </div>
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Button variant="ghost" size="icon" aria-label="Help">
        <HelpCircleIcon className="h-4 w-4" />
      </Button>
    </div>
  </div>
</nav>
```

**States:**

- Default: bg-background/80 with blur
- Scrolled: adds `shadow-sm` (via scroll event listener)

**Mobile:** Logo text hidden (`hidden sm:inline`); only icon shown.

---

### 7.2 `MetaInputForm`

**shadcn/ui reference:** Uses `Label`, `Textarea`, `Input`.

A card containing four controlled inputs: Title, Description, URL, Keyword.

```
<div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
  <h2 className="text-xl font-semibold text-card-foreground">
    Enter Your Page Information
  </h2>
  <div className="space-y-4">
    <TitleField />
    <DescriptionField />
    <UrlField />
    <KeywordField />
  </div>
</div>
```

**States:**

- Default: white card, labeled fields
- Focused field: `ring-2 ring-ring` on the textarea/input
- Invalid URL: red border + error text below
- All fields empty: score bars show at 0%, error state

---

### 7.3 `ScoredField` (reusable wrapper for Title, Description, Keyword)

**Props:**

```typescript
interface ScoredFieldProps {
  id: string;
  label: string;
  charCount: number;
  charLimit: number; // used for progress bar width calculation
  score: ScoringResult;
  children: React.ReactNode; // the <textarea> or <input>
}
```

**Anatomy:**

```
[Label]                             [charCount chars]
[Input / Textarea                              ]
[Progress bar track ─────────────────────────]
[▓▓▓▓▓▓▓▓░░░░░░░░]  [score%]
[Score message text]
```

**Progress bar calculation:**

- Title: `width = min(100, (charCount / 60) * 100)%`
- Description: `width = min(100, (charCount / 160) * 100)%`
- Keyword: `width = score%` (directly from scoring result)

**Progress bar color by status:**

```
good    → bg-green-500
warning → bg-yellow-500
error   → bg-red-500
```

**Bar height:** `h-2` (8px), track `bg-slate-200 dark:bg-slate-700 rounded-full`

**Transitions:** `transition-all duration-300 ease-out` on the fill div

---

### 7.4 `OverallScoreCard`

**shadcn/ui reference:** Uses `Card`, `CardHeader`, `CardContent`.

```
<Card>
  <CardContent className="p-4 sm:p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">Overall SEO Score</h2>
      <div>
        <span className="text-5xl font-bold [color from score]">{overall}</span>
        <span className="text-2xl text-muted-foreground">/100</span>
      </div>
    </div>
    <div className="h-4 bg-muted rounded-full overflow-hidden">
      <div className="h-full transition-all duration-300 ease-out [color from score]"
           style={{ width: `${overall}%` }} />
    </div>
    <p className="text-xs text-muted-foreground mt-2">
      Title 40% · Description 40% · Keyword 20%
    </p>
  </CardContent>
</Card>
```

**Score color thresholds:**
| Range | Color Class | Hex |
|-------|-------------|-----|
| ≥ 80 | `text-green-600` / `bg-green-500` | `#16A34A` / `#22C55E` |
| 50–79 | `text-yellow-600` / `bg-yellow-500` | `#CA8A04` / `#EAB308` |
| < 50 | `text-red-600` / `bg-red-500` | `#DC2626` / `#EF4444` |

**Variants:**

- Desktop: score number right-aligned next to title
- Mobile: score number stacked below title

---

### 7.5 `PreviewPanel`

**shadcn/ui reference:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.

```
<Card>
  <CardHeader className="flex-row items-center justify-between pb-0">
    <h2 className="text-xl font-semibold">Preview</h2>
    <div className="flex gap-1">
      <ExportButton />
      <ShareButton />
      <EmbedButton />
    </div>
  </CardHeader>
  <CardContent className="p-4 sm:p-6">
    <Tabs defaultValue="google">
      <TabsList className="mb-4 w-full sm:w-auto">
        <TabsTrigger value="google">Google</TabsTrigger>
        <TabsTrigger value="bing">Bing</TabsTrigger>
        <TabsTrigger value="social">Social</TabsTrigger>
        <TabsTrigger value="mobile">Mobile</TabsTrigger>
      </TabsList>
      <TabsContent value="google"><GooglePreview /></TabsContent>
      <TabsContent value="bing"><BingPreview /></TabsContent>
      <TabsContent value="social"><SocialCardPreview /></TabsContent>
      <TabsContent value="mobile"><MobilePreview /></TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

**Tab styles:**

- `TabsList`: `bg-muted rounded-lg p-1`
- `TabsTrigger` active: `bg-background shadow-sm text-foreground`
- `TabsTrigger` inactive: `text-muted-foreground`
- On mobile: `TabsList` is full-width (`grid grid-cols-4`)

---

### 7.6 `GooglePreview`

Pixel-accurate Google desktop SERP snippet.

**Anatomy (max-width: 600px, mimicking Google's result card width):**

```
┌──────────────────────────────────────────┐
│  [🌐] example.com › sample-page          │  ← URL chip
│  Example Page Title | My Website         │  ← Title (link style)
│  This is an example meta description...  │  ← Snippet
└──────────────────────────────────────────┘
```

**Exact styles:**

```
Container: max-w-[600px] bg-white dark:bg-[#202124] rounded p-3 font-[Arial,sans-serif]

Favicon row:
  <div className="flex items-center gap-2 mb-1">
    <div className="w-4 h-4 rounded-full bg-[#E8EAED]" />  {/* Favicon placeholder */}
    <span className="text-sm text-[#202124] dark:text-[#BDC1C6]">{domain}</span>
    <span className="text-sm text-[#202124] dark:text-[#BDC1C6]"> › {slug}</span>
  </div>

Title:
  <h3 className="text-[#1A0DAB] dark:text-[#8AB4F8] text-xl leading-snug cursor-pointer hover:underline"
      style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px' }}>
    {truncate(title, 60)}
  </h3>

Description:
  <p className="text-[#4D5156] dark:text-[#BDC1C6] text-sm leading-snug mt-1"
     style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
    {truncate(description, 160)}
  </p>
```

**Truncation behavior:**

- Title > 60 chars: appended with `…` at char 57 + `…`
- Description > 160 chars: appended with `…` at char 157
- Mobile tab: Title truncated at 50, description at 120

**Variants:**

- `device="desktop"` — full width up to 600px
- `device="mobile"` — max-width 360px, smaller font (17px title, 13px desc)

---

### 7.7 `BingPreview`

Pixel-accurate Bing SERP snippet.

**Exact styles:**

```
Container: max-w-[600px] bg-white dark:bg-[#1B1B1B] rounded p-3

Title:
  <a className="text-[#001B9A] dark:text-[#8AB4F8]"
     style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: '19px' }}>
    {truncate(title, 65)}
  </a>

URL:
  <div className="text-[#006400] dark:text-[#4CAF50] text-xs mt-0.5">
    {url}
  </div>

Description:
  <p className="text-[#767676] dark:text-[#A8A8A8] text-[13px] mt-1">
    {truncate(description, 165)}
  </p>
```

---

### 7.8 `SocialCardPreview`

Open Graph / Twitter Card preview.

**Anatomy:**

```
┌─────────────────────────────────────────┐
│  [OG Image area — 1200×630 ratio]       │
│  Placeholder: dashed border, gray bg    │
│  Icon: ImageIcon centered               │
│  Caption: "Add ogImage URL for preview" │
├─────────────────────────────────────────┤
│  example.com                            │  ← domain, uppercase, small caps
│  OG Title (or fallback to title)        │  ← bold, clamp-2
│  OG Description (or fallback to desc)  │  ← clamp-3, muted
└─────────────────────────────────────────┘
```

**Container:** `border border-border rounded-lg overflow-hidden max-w-[500px]`

**Image area:**

```
aspect-[1.91/1] bg-muted border-b border-border
flex items-center justify-center
If ogImage provided: <img src={ogImage} className="w-full h-full object-cover" />
If not: placeholder with dashed border
```

**Text area:**

```
p-3 bg-card
<p className="text-xs uppercase text-muted-foreground tracking-wide">{domain}</p>
<p className="font-semibold text-sm text-card-foreground line-clamp-2">{ogTitle || title}</p>
<p className="text-xs text-muted-foreground mt-1 line-clamp-3">{ogDescription || description}</p>
```

**Platform toggle:** Small `ToggleGroup` above the preview:

```
[Twitter/X] [LinkedIn] [Facebook]
```

Each platform variant adjusts the card dimensions and text limits shown.

---

### 7.9 `MobilePreview`

Renders the Google SERP preview at 360px width inside a phone frame chrome.

```
Container: max-w-[375px] mx-auto

Phone chrome:
  <div className="border-2 border-slate-800 dark:border-slate-600 rounded-[2rem] overflow-hidden">
    {/* Status bar */}
    <div className="bg-slate-800 dark:bg-slate-900 h-6 flex items-center px-4">
      <span className="text-white text-xs">9:41</span>
    </div>
    {/* Browser chrome */}
    <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 border-b border-slate-200 dark:border-slate-700">
      <div className="bg-white dark:bg-slate-700 rounded text-xs px-2 py-1 text-muted-foreground truncate">
        {url || 'google.com'}
      </div>
    </div>
    {/* SERP Result */}
    <div className="bg-white dark:bg-[#202124] p-3 font-[Arial,sans-serif]">
      <GooglePreview device="mobile" />
    </div>
  </div>
```

**Truncation warning banner (conditional):**

```
{mobileTruncation.totalIssues > 0 && (
  <div className="mt-3 flex items-start gap-2 rounded-md bg-yellow-50 dark:bg-yellow-900/30
                  border border-yellow-200 dark:border-yellow-800 p-3 text-sm">
    <AlertTriangleIcon className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-medium text-yellow-800 dark:text-yellow-200">
        Mobile truncation detected
      </p>
      <ul className="mt-1 text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
        {mobileTruncation.titleTruncated && <li>Title truncated at 50 chars (currently {title.length})</li>}
        {mobileTruncation.descriptionTruncated && <li>Description truncated at 120 chars (currently {description.length})</li>}
      </ul>
    </div>
  </div>
)}
```

---

### 7.10 `ScoreBadge`

Inline status pill. Used in summary views.

**shadcn/ui reference:** `Badge` variant.

```typescript
interface ScoreBadgeProps {
  status: "good" | "warning" | "error";
  score: number;
  label?: string;
}
```

**Variants:**

```
good:    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
warning: <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
error:   <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
```

**Size:** `text-xs px-2 py-0.5 rounded-full font-medium`

**Icon prefix:**

```
good    → <CheckCircle2Icon className="h-3 w-3 mr-1" />
warning → <AlertTriangleIcon className="h-3 w-3 mr-1" />
error   → <XCircleIcon className="h-3 w-3 mr-1" />
```

---

### 7.11 `ExportButton`

**shadcn/ui reference:** `Button` + `DropdownMenu`.

```
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="gap-1.5">
      <DownloadIcon className="h-4 w-4" />
      <span className="hidden sm:inline">Export</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={() => exportScreenshot('png')}>
      Download PNG
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => exportScreenshot('jpg')}>
      Download JPG
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**States:**

- Default: outline button
- Loading: spinner replaces download icon, button disabled (`cursor-wait opacity-70`)
- Success: brief success toast (2s) after download triggers

---

### 7.12 `ShareButton`

**shadcn/ui reference:** `Button` + `Tooltip`.

```
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline" size="sm" onClick={copyShareLink} aria-label="Copy share link">
      {copied ? <CheckIcon className="h-4 w-4" /> : <Share2Icon className="h-4 w-4" />}
    </Button>
  </TooltipTrigger>
  <TooltipContent>{copied ? 'Copied!' : 'Copy shareable link'}</TooltipContent>
</Tooltip>
```

**States:**

- Default: Share2 icon
- Copied (2s): CheckIcon, tooltip "Copied!"

---

### 7.13 `EmbedDialog`

**shadcn/ui reference:** `Dialog`, `Switch`, `Input`, `Button`.

```
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm" aria-label="Get embed code">
      <CodeIcon className="h-4 w-4" />
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Embed Widget</DialogTitle>
      <DialogDescription>
        Embed this SEO preview widget on your website or blog.
      </DialogDescription>
    </DialogHeader>

    {/* Config Options */}
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="show-scores">Show scores</Label>
        <Switch id="show-scores" checked={showScores} onCheckedChange={setShowScores} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="show-previews">Show previews</Label>
        <Switch id="show-previews" checked={showPreviews} onCheckedChange={setShowPreviews} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="compact">Compact mode</Label>
        <Switch id="compact" checked={compactMode} onCheckedChange={setCompactMode} />
      </div>
    </div>

    {/* Generated Code */}
    <div className="relative">
      <pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto font-mono">
        {embedCode}
      </pre>
      <Button size="sm" className="absolute top-2 right-2" onClick={copyEmbedCode}>
        {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
      </Button>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 7.14 `ThemeToggle`

**shadcn/ui reference:** `Button`.

```
<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
  {isDark
    ? <SunIcon className="h-4 w-4" />
    : <MoonIcon className="h-4 w-4" />}
</Button>
```

Theme preference stored in `localStorage['seo-theme']`. FOUC prevention via inline `<script>` in `<head>`.

---

### 7.15 `Toast` / `Sonner`

Used for transient success/error notifications.

**shadcn/ui reference:** Sonner (or `useToast` from shadcn/ui).

| Trigger           | Type    | Message                            |
| ----------------- | ------- | ---------------------------------- |
| Export complete   | success | "Preview exported as PNG"          |
| Export failed     | error   | "Export failed. Please try again." |
| Link copied       | success | "Link copied to clipboard"         |
| Embed code copied | success | "Embed code copied"                |

**Position:** `bottom-right`, `duration: 3000ms`

---

### 7.16 `CharacterCounter`

Inline span shown next to field label.

```
<span className="text-xs text-muted-foreground ml-1 font-mono">
  ({charCount} chars)
</span>
```

Color shifts on thresholds:

- Title 30–60: `text-green-600`
- Title 61–70: `text-yellow-600`
- Title >70 or <30: `text-red-600`
- Same logic for description (120–160, 161–200, else)

---

### 7.17 `MobileTruncationBanner`

Conditional warning shown below a `ScoredField` when mobile truncation is triggered.

```
{isTruncated && (
  <div role="alert" className="flex items-center gap-1.5 mt-1.5 text-xs text-yellow-700
                               dark:text-yellow-300">
    <AlertTriangleIcon className="h-3 w-3 flex-shrink-0" />
    <span>Will be truncated on mobile at {mobileLimit} characters</span>
  </div>
)}
```

---

## 8. Accessibility Requirements

### 8.1 Color Contrast (WCAG AA)

All text/background combinations must meet a minimum **4.5:1** ratio for normal text and **3:1** for large text (≥18pt or 14pt bold).

| Foreground | Background | Ratio     | Usage                    |
| ---------- | ---------- | --------- | ------------------------ |
| `#090909`  | `#FFFFFF`  | 21:1 ✅   | Body text light mode     |
| `#737373`  | `#FFFFFF`  | 4.6:1 ✅  | Muted text light mode    |
| `#FAFAFA`  | `#090909`  | 19.6:1 ✅ | Body text dark mode      |
| `#A3A3A3`  | `#090909`  | 5.8:1 ✅  | Muted text dark mode     |
| `#166534`  | `#DCFCE7`  | 5.5:1 ✅  | Good badge text/bg       |
| `#854D0E`  | `#FEF9C3`  | 5.8:1 ✅  | Warning badge text/bg    |
| `#991B1B`  | `#FEE2E2`  | 5.9:1 ✅  | Error badge text/bg      |
| `#1A0DAB`  | `#FFFFFF`  | 9.0:1 ✅  | Google title (preview)   |
| `#4D5156`  | `#FFFFFF`  | 5.9:1 ✅  | Google snippet (preview) |

> **Note:** The Google/Bing preview cards render with hardcoded colors to match real SERPs. These are informational previews, not interactive content, and are marked `aria-hidden="true"` where preview-only content is concerned.

### 8.2 Keyboard Navigation

| Action                   | Key(s)                                         |
| ------------------------ | ---------------------------------------------- |
| Move between form fields | `Tab` / `Shift+Tab`                            |
| Switch preview tabs      | `Tab` to `TabsList`, then `←` / `→` arrow keys |
| Open Export dropdown     | `Enter` or `Space` on trigger                  |
| Select export format     | `↑` / `↓` arrows, `Enter` to confirm           |
| Open/close embed dialog  | `Enter` on trigger, `Escape` to close          |
| Copy share link          | `Enter` or `Space` on share button             |
| Toggle theme             | `Enter` or `Space` on theme button             |
| Dismiss toast            | `Escape`                                       |

**Focus management:**

- When `EmbedDialog` opens, focus moves to the first interactive element (`DialogTitle` is programmatically focused via `autoFocus`)
- When dialog closes, focus returns to the trigger button
- Export dropdown: focus returns to trigger on close/select

**Focus ring:** All interactive elements use `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. Native focus outline is removed only when `focus-visible` polyfill is active.

### 8.3 ARIA Labels & Roles

| Element                  | ARIA attribute                                      | Value                                              |
| ------------------------ | --------------------------------------------------- | -------------------------------------------------- |
| Navbar                   | `role="navigation"`                                 | —                                                  |
| Navbar                   | `aria-label`                                        | `"Main navigation"`                                |
| Score progress bars      | `role="progressbar"`                                | —                                                  |
| Score progress bars      | `aria-valuenow`                                     | `{score}`                                          |
| Score progress bars      | `aria-valuemin`                                     | `"0"`                                              |
| Score progress bars      | `aria-valuemax`                                     | `"100"`                                            |
| Score progress bars      | `aria-label`                                        | e.g., `"Title score: 100 out of 100"`              |
| Score message            | `aria-live="polite"`                                | — (updates as user types)                          |
| Overall score            | `aria-live="polite"`                                | —                                                  |
| Mobile truncation banner | `role="alert"`                                      | —                                                  |
| Embed dialog             | `aria-modal="true"`                                 | —                                                  |
| Preview tabs             | `role="tablist"` / `role="tab"` / `role="tabpanel"` | Via Radix `@radix-ui/react-tabs`                   |
| Export button            | `aria-label`                                        | `"Export preview as image"`                        |
| Share button             | `aria-label`                                        | `"Copy shareable link"`                            |
| Embed button             | `aria-label`                                        | `"Get embed code"`                                 |
| Theme toggle             | `aria-label`                                        | `"Switch to dark mode"` / `"Switch to light mode"` |
| Google preview           | `aria-label`                                        | `"Google search result preview"`                   |
| Bing preview             | `aria-label`                                        | `"Bing search result preview"`                     |
| Social preview           | `aria-label`                                        | `"Social media card preview"`                      |
| Mobile preview           | `aria-label`                                        | `"Mobile SERP preview"`                            |
| Form                     | `aria-label`                                        | `"SEO metadata input form"`                        |
| Char counter             | `aria-live="polite"`                                | updates on change                                  |

### 8.4 Touch Targets

All interactive elements must have a minimum **44×44px** touch target per WCAG 2.5.5.

| Component               | Target size                                                  |
| ----------------------- | ------------------------------------------------------------ |
| All `Button` components | Min `h-11 w-11` or `h-11 px-4`                               |
| `size="icon"` buttons   | `h-10 w-10` + 4px padding = 44px effective                   |
| Tab triggers            | `h-9 px-4` — meets 44px via touch target extension if needed |
| `Switch` toggle         | 44×24px track; 44px touch target via padding                 |

**Implementation note:** Add `className="touch-target"` utility:

```css
.touch-target {
  position: relative;
}
.touch-target::after {
  content: "";
  position: absolute;
  inset: -4px;
}
```

### 8.5 Screen Reader Announcements

- Score messages are wrapped in `aria-live="polite"` regions so they are read after the user pauses typing
- The overall score region uses `aria-live="polite"` and `aria-atomic="true"` to announce the complete score when it changes
- Error messages use `role="alert"` for immediate announcement (URL validation errors)
- Toast notifications are rendered into a live region (`aria-live="assertive"` for errors, `"polite"` for success)

### 8.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-opacity,
  [class*="duration-"] {
    transition: none !important;
  }
  [class*="animate-"] {
    animation: none !important;
  }
}
```

Score bar width still updates; only the transition animation is removed.

---

## 9. Responsive Breakpoints

### Breakpoint Definitions

| Name           | Min Width | Tailwind Prefix | Target Device               |
| -------------- | --------- | --------------- | --------------------------- |
| `xs` (default) | 0px       | (none)          | Small phones (≤375px)       |
| `sm`           | 640px     | `sm:`           | Large phones, small tablets |
| `md`           | 768px     | `md:`           | Tablets portrait            |
| `lg`           | 1024px    | `lg:`           | Tablets landscape, laptops  |
| `xl`           | 1280px    | `xl:`           | Desktops                    |
| `2xl`          | 1536px    | `2xl:`          | Wide monitors               |

### What Changes at Each Breakpoint

#### Default (0–639px) — Mobile

- Single-column stacked layout
- Page title: `text-4xl`
- Card padding: `p-4`
- Tab list: `grid grid-cols-4 w-full` (equal-width tabs)
- Tab trigger text: abbreviations — "Google" → "G", "Social" → "OG"
- Toolbar buttons: icon-only (`size="icon"`)
- Footer: centered, `text-xs`
- Navbar logo text: hidden

#### `sm:` (640px–767px) — Large phones

- Card padding: `p-6`
- Toolbar buttons: icon + short label text visible (`hidden sm:inline`)
- Tab triggers: full labels visible
- Navbar logo text: visible

#### `md:` (768px–1023px) — Tablets

- Page title: `text-5xl`
- Page description: `text-lg`
- Page top padding: `py-12`
- All sections still single-column

#### `lg:` (1024px+) — Desktop / Two-Column Split

- Layout switches to `flex flex-row gap-8`
- Left column (inputs): `w-full max-w-md flex-shrink-0`
- Right column (score + preview): `flex-1 min-w-0`
- Overall score card: moves to top of right column
- Score card: score number right-aligned vs. stacked

#### `xl:` (1280px+) — Wide Desktop

- Container constrained to `max-w-screen-xl`
- Left column: `max-w-lg`
- Preview panel: can show wider previews

#### `2xl:` (1536px+)

- No new layout changes; content stays centered within `max-w-screen-xl`
- Preview card can optionally render Google SERP at true 600px width

### Responsive Behavior Summary Table

| Feature                  | Mobile            | Tablet         | Desktop          |
| ------------------------ | ----------------- | -------------- | ---------------- |
| Layout                   | Single column     | Single column  | Two columns      |
| Page h1 size             | `text-4xl`        | `text-5xl`     | `text-5xl`       |
| Card padding             | `p-4`             | `p-6`          | `p-6`            |
| Tab labels               | Grid, abbreviated | Full labels    | Full labels      |
| Toolbar buttons          | Icon only         | Icon + label   | Icon + label     |
| Score card position      | Below form        | Below form     | Top-right column |
| Preview width            | Full width        | Full width     | 60% column       |
| Phone frame (Mobile tab) | Scaled to fit     | Full size      | Full size        |
| Navbar logo              | Icon only         | Icon + text    | Icon + text      |
| OG card max-width        | Full width        | 500px centered | 500px in panel   |

---

## 10. Loading, Empty & Error States

### 10.1 Initial Page Load

**Shell (before hydration):**

- Next.js static shell renders header, card outlines, and tab structure
- Inputs have pre-filled placeholder values (from `useState` defaults)
- Score bars render at default values immediately (no skeleton needed)
- No spinner; the app is fully client-side with pre-filled data

**If JS is disabled:**

- Show a `<noscript>` banner: "This tool requires JavaScript to run."
- Tailwind class: `bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md`

---

### 10.2 Form Fields

#### Title Field

| State               | Behavior                                                                  |
| ------------------- | ------------------------------------------------------------------------- |
| **Empty**           | Bar at 0%, red status, message: "Title is required", char count "0 chars" |
| **Too short** (<30) | Bar at proportional %, red bar, message with count                        |
| **Optimal** (30–60) | Bar at 100% green, "Perfect length" message                               |
| **Warning** (61–70) | Bar at ~90% yellow, "Slightly long" message                               |
| **Too long** (>70)  | Bar at 100% red (capped), "Will be truncated" message                     |

#### Description Field

| State                    | Behavior                                                      |
| ------------------------ | ------------------------------------------------------------- |
| **Empty**                | Bar 0%, red, "Meta description is recommended for better CTR" |
| **Short** (<120)         | Bar proportional %, yellow, "Too short – aim for 155–160"     |
| **Optimal** (120–160)    | Bar proportional %, green, "Optimal length"                   |
| **Acceptable** (161–200) | Bar ~90%, yellow, "Slightly long, will truncate"              |
| **Too long** (>200)      | Bar 100% red, "Too long – Google truncates to ~160 chars"     |

#### URL Field

| State       | Behavior                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Empty**   | No error (URL is optional), placeholder shown                                                                              |
| **Valid**   | No indicator; domain extracted and shown in preview                                                                        |
| **Invalid** | Red error text below: "Invalid URL format. Start with http:// or https://" — `text-xs text-red-600 dark:text-red-400 mt-1` |

#### Keyword Field

| State                   | Behavior                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| **Empty**               | Bar 0%, red, "Enter a keyword to check"                               |
| **In both**             | 100% green, "Keyword found in both title and description. Excellent." |
| **In title only**       | 90% green, "Consider adding to description."                          |
| **In description only** | 70% yellow, "Adding to title would strengthen relevance."             |
| **Not found**           | 0% red, "Keyword '{keyword}' not found in title or description."      |

---

### 10.3 Preview Panels

#### Google Preview

| State                    | Behavior                                              |
| ------------------------ | ----------------------------------------------------- |
| **Default (pre-filled)** | Renders with example data immediately                 |
| **Empty title**          | Shows "Untitled" in grey italic in the title position |
| **Empty URL**            | Shows `example.com` as domain                         |
| **Very long title**      | Truncated with `…` at char 57/50 (desktop/mobile)     |
| **No keyword**           | Preview renders normally; no keyword highlighting     |

#### Bing Preview

| State           | Behavior                             |
| --------------- | ------------------------------------ |
| **Default**     | Renders with current data            |
| **Empty title** | Same as Google — "Untitled" fallback |
| **Empty URL**   | `example.com` fallback               |

#### Social Card Preview

| State                   | Behavior                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| **No ogImage**          | Dashed border placeholder with `ImageIcon` centered, caption: "Add an ogImage URL to see a preview" |
| **Invalid ogImage URL** | Image `onError`: fall back to placeholder, show inline error: "Image failed to load"                |
| **ogImage loading**     | Spinner overlay (`animate-spin`) on image area during fetch                                         |
| **ogImage loaded**      | `object-cover` fill, no caption                                                                     |
| **No ogTitle**          | Falls back to `title` field                                                                         |
| **No ogDescription**    | Falls back to `description` field                                                                   |
| **All fields empty**    | Card shows placeholder image, "Untitled" title, empty description                                   |

#### Mobile Preview

| State                     | Behavior                                     |
| ------------------------- | -------------------------------------------- |
| **No truncation issues**  | Standard preview, no warning banner          |
| **Title truncated**       | Yellow warning banner below preview          |
| **Description truncated** | Yellow warning banner below preview          |
| **Both truncated**        | Single banner with two bullet points         |
| **Empty fields**          | Phone frame shows with empty/default content |

---

### 10.4 Export

| State         | Behavior                                                                     |
| ------------- | ---------------------------------------------------------------------------- |
| **Idle**      | `<DownloadIcon>` + "Export" label                                            |
| **Capturing** | `<LoaderIcon className="animate-spin">`, button disabled, `aria-busy="true"` |
| **Success**   | Download auto-triggers, success toast shown for 3s                           |
| **Error**     | Error toast: "Export failed. Please try again.", button resets               |

**Error scenarios:**

- `html2canvas` throws (rare; CORS on cross-origin images) → catch block shows error toast
- OG image is cross-origin → warn: "External OG image may not export. Use a local image."

---

### 10.5 Share Link

| State               | Behavior                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **Idle**            | `<Share2Icon>` button                                                                          |
| **Generating**      | Synchronous — no loading state needed                                                          |
| **Copied**          | `<CheckIcon>`, tooltip "Copied!", reverts after 2s                                             |
| **Clipboard error** | Falls back to `<input>` with pre-selected URL in a popover, message: "Copy this link manually" |

---

### 10.6 Embed Dialog

| State               | Behavior                                                      |
| ------------------- | ------------------------------------------------------------- |
| **Closed**          | `<CodeIcon>` button                                           |
| **Open**            | Dialog modal, config options + code block                     |
| **Code copied**     | Checkmark on copy button inside the `<pre>`, reverts after 2s |
| **Long embed code** | Code block has `overflow-x-auto` to scroll horizontally       |

---

### 10.7 Overall Score Card

| State                              | Behavior                       |
| ---------------------------------- | ------------------------------ |
| **All fields filled (≥80)**        | Green score number + green bar |
| **Some fields suboptimal (50–79)** | Yellow score + yellow bar      |
| **Major issues (<50)**             | Red score + red bar            |
| **Empty form**                     | Score shows `0` in red         |

---

### 10.8 Widget Mode (`?widget=1`)

| State                       | Behavior                                           |
| --------------------------- | -------------------------------------------------- |
| **No URL params**           | Widget renders with empty inputs                   |
| **With defaultTitle param** | Inputs pre-filled from URL params                  |
| **`showScores=false`**      | Score section hidden, preview only                 |
| **`compactMode=true`**      | Preview constrained to 320px, inputs stacked tight |
| **Invalid params**          | Silently ignored; empty/default values used        |

---

## Appendix A: Component Hierarchy

```
App (layout.tsx)
├── Navbar
│   ├── Logo
│   └── ThemeToggle
└── Home (page.tsx)
    ├── PageHeader
    │   ├── h1
    │   └── p (description)
    ├── PreviewDashboard (client component)
    │   ├── MetaInputForm
    │   │   ├── ScoredField (Title)
    │   │   │   ├── Label + CharacterCounter
    │   │   │   ├── Textarea
    │   │   │   ├── ProgressBar
    │   │   │   ├── ScorePercentage
    │   │   │   ├── ScoreMessage (aria-live)
    │   │   │   └── MobileTruncationBanner (conditional)
    │   │   ├── ScoredField (Description)
    │   │   │   └── (same as above)
    │   │   ├── UrlField
    │   │   │   ├── Label
    │   │   │   ├── Input
    │   │   │   └── UrlValidationError (conditional, role="alert")
    │   │   └── ScoredField (Keyword)
    │   │       └── (same as ScoredField)
    │   ├── OverallScoreCard
    │   │   ├── ScoreDisplay (aria-live)
    │   │   ├── ScoreBar (role="progressbar")
    │   │   └── WeightingNote
    │   └── PreviewPanel
    │       ├── PreviewToolbar
    │       │   ├── ExportButton → DropdownMenu
    │       │   ├── ShareButton → Tooltip
    │       │   └── EmbedButton → EmbedDialog
    │       └── Tabs (Radix)
    │           ├── TabsList
    │           │   ├── TabsTrigger (Google)
    │           │   ├── TabsTrigger (Bing)
    │           │   ├── TabsTrigger (Social)
    │           │   └── TabsTrigger (Mobile)
    │           ├── TabsContent → GooglePreview
    │           ├── TabsContent → BingPreview
    │           ├── TabsContent → SocialCardPreview
    │           └── TabsContent → MobilePreview
    └── Footer
```

---

## Appendix B: Animation & Transition Catalog

| Element                | Property                 | Duration    | Easing        | Class                                  |
| ---------------------- | ------------------------ | ----------- | ------------- | -------------------------------------- |
| Score progress bars    | `width`                  | 300ms       | `ease-out`    | `transition-all duration-300 ease-out` |
| Tab content switch     | `opacity`                | 150ms       | `ease-in-out` | `transition-opacity duration-150`      |
| Share button icon swap | `opacity`                | 150ms       | `ease`        | `transition-opacity`                   |
| Export spinner         | rotation                 | 1000ms loop | `linear`      | `animate-spin`                         |
| Dialog open            | scale + opacity          | 200ms       | Radix default | via `@radix-ui/react-dialog`           |
| Dropdown menu open     | `translateY` + `opacity` | 150ms       | `ease-out`    | via `@radix-ui/react-dropdown-menu`    |
| Toast enter/exit       | `translateX` + `opacity` | 300ms       | `ease`        | via Sonner                             |
| Theme switch           | `background`, `color`    | instant     | —             | CSS variable swap, no transition       |

---

## Appendix C: Tailwind Class Quick Reference

### Card Pattern

```
rounded-lg border border-border bg-card text-card-foreground shadow-sm
```

### Form Input Pattern

```
w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground
placeholder:text-muted-foreground
focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
disabled:cursor-not-allowed disabled:opacity-50
```

### Score Progress Track

```
h-2 w-full bg-muted rounded-full overflow-hidden
```

### Score Progress Fill

```
h-full transition-all duration-300 ease-out rounded-full
[good: bg-green-500] [warning: bg-yellow-500] [error: bg-red-500]
```

### Warning Banner

```
flex items-start gap-2 rounded-md border border-yellow-200 dark:border-yellow-800
bg-yellow-50 dark:bg-yellow-900/30 p-3 text-sm
```

### Error Text

```
text-xs text-destructive mt-1
```

### Muted Caption

```
text-xs text-muted-foreground
```
