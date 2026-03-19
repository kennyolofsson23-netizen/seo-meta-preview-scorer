# SEO Meta Preview & Scorer — Architecture Document

## 1. Tech Stack

| Layer         | Choice                                                  | Rationale                                                                                  |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Framework     | **Next.js 16** (App Router)                             | Already scaffolded; SSR for SEO landing page; static export possible for zero-cost hosting |
| Language      | **TypeScript 6.x** (strict mode)                        | Already configured with strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes       |
| Styling       | **Tailwind CSS 4**                                      | Already installed; utility-first for pixel-perfect SERP recreation                         |
| UI Components | **Radix UI** + custom                                   | Already installed; accessible primitives for tabs, tooltips, dialogs                       |
| Icons         | **Lucide React**                                        | Already installed; tree-shakeable, optimized via next.config                               |
| Screenshot    | **html2canvas**                                         | Already installed; client-side DOM-to-canvas rendering, no server needed                   |
| Testing       | **Vitest** + **React Testing Library** + **Playwright** | Already configured; fast unit tests + E2E                                                  |
| Fonts         | **next/font** (Geist) + Google Fonts for SERP accuracy  | Self-hosted, zero layout shift                                                             |
| Deployment    | **Vercel**                                              | Zero-config for Next.js; edge CDN; free tier sufficient                                    |
| Analytics     | **Plausible** (optional)                                | Privacy-respecting, no cookies, GDPR compliant                                             |

### No Database Required

This is a 100% client-side tool. All state lives in React state and localStorage. No database, no Prisma schema, no API routes for data storage. This is a deliberate architectural decision — zero server costs, zero data liability, instant performance.

---

## 2. Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, metadata, theme)
│   ├── page.tsx                      # Home page — main tool
│   ├── globals.css                   # Tailwind base + SERP-accurate custom CSS
│   ├── embed/
│   │   └── page.tsx                  # Embeddable widget page (iframe source)
│   ├── widget/
│   │   └── page.tsx                  # Widget configuration / get embed code page
│   └── api/
│       └── og/
│           └── route.ts              # Dynamic OG image generation for shared screenshots
├── components/
│   ├── ui/                           # Shared UI primitives (shadcn-style)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Tabs.tsx
│   │   ├── Tooltip.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ThemeToggle.tsx
│   ├── dashboard/
│   │   └── PreviewDashboard.tsx      # Main orchestrator (client component)
│   ├── input/
│   │   ├── MetaInputForm.tsx         # Title, description, URL, keyword inputs
│   │   └── CharacterCounter.tsx      # Real-time char count with color coding
│   ├── preview/
│   │   ├── GoogleDesktopPreview.tsx   # Pixel-perfect Google desktop SERP
│   │   ├── GoogleMobilePreview.tsx    # Pixel-perfect Google mobile SERP
│   │   ├── BingPreview.tsx           # Pixel-perfect Bing SERP
│   │   ├── SocialCardPreview.tsx     # OG/social media card preview
│   │   └── PreviewContainer.tsx      # Tabbed container for all previews
│   ├── scoring/
│   │   ├── ScoreDashboard.tsx        # Score overview with gauges
│   │   ├── ScoreCard.tsx             # Individual score card (title/desc/keyword)
│   │   ├── MobileTruncationWarning.tsx
│   │   └── OverallScoreGauge.tsx     # Circular gauge 0-100
│   ├── export/
│   │   ├── ScreenshotButton.tsx      # Download screenshot trigger
│   │   └── ScreenshotWatermark.tsx   # Watermark overlay for exports
│   ├── embed/
│   │   ├── EmbedCodeGenerator.tsx    # Generate & copy embed snippet
│   │   └── WidgetWrapper.tsx         # Compact widget layout
│   ├── affiliate/
│   │   └── AffiliateRecommendation.tsx # Contextual affiliate CTA
│   └── history/
│       └── HistoryPanel.tsx          # Recent checks sidebar (P2)
├── lib/
│   ├── scoring.ts                    # Scoring algorithms (already exists)
│   ├── scoring.test.ts               # Scoring unit tests (already exists)
│   ├── truncation.ts                 # Pixel-accurate truncation logic
│   ├── screenshot.ts                 # html2canvas wrapper + watermark
│   ├── history.ts                    # localStorage read/write for history
│   ├── embed.ts                      # Embed code generation
│   ├── constants.ts                  # SERP dimensions, char limits, font specs
│   ├── utils.ts                      # General utilities (already exists)
│   └── hooks/
│       ├── useMetaInput.ts           # Form state management hook
│       ├── useScores.ts              # Derived scoring from inputs
│       ├── useTheme.ts               # Theme toggle with localStorage persistence
│       └── useHistory.ts             # History read/write hook (P2)
├── test/
│   ├── setup.ts                      # Vitest setup (already exists)
│   └── fixtures/
│       └── meta-samples.ts           # Test data for various title/description lengths
└── types/
    └── index.ts                      # Type definitions (already exists)
```

---

## 3. API Design

This tool has **minimal API surface** — it's primarily client-side. Only two server routes exist:

### Route: `GET /api/og`

**Purpose**: Generate dynamic Open Graph images for shared tool links.

```
GET /api/og?title=My+Page+Title&score=85
```

**Response**: PNG image (1200x630)
**Auth**: None (public)
**Implementation**: Next.js `ImageResponse` from `next/og`

### Route: `GET /embed` (Page, not API)

**Purpose**: Serve the embeddable widget in an iframe.

```
GET /embed?compact=true&showScores=true
```

**Query Parameters**:
| Param | Type | Default | Description |
|---|---|---|---|
| `compact` | boolean | `true` | Compact layout for embedding |
| `showScores` | boolean | `true` | Show/hide score dashboard |
| `showPreviews` | boolean | `true` | Show/hide preview tabs |
| `title` | string | `""` | Pre-filled title |
| `description` | string | `""` | Pre-filled description |
| `url` | string | `""` | Pre-filled URL |

**Response**: Full HTML page (rendered in iframe)
**Auth**: None (public)

---

## 4. Page / Route Map

| URL       | Page                  | Data Requirements   | Auth | Description                              |
| --------- | --------------------- | ------------------- | ---- | ---------------------------------------- |
| `/`       | `app/page.tsx`        | None (client state) | None | Main tool — input form, previews, scores |
| `/embed`  | `app/embed/page.tsx`  | Query params        | None | Compact widget for iframe embedding      |
| `/widget` | `app/widget/page.tsx` | None                | None | Widget config page — generate embed code |
| `/api/og` | `app/api/og/route.ts` | Query params        | None | Dynamic OG image generation              |

---

## 5. Component Hierarchy

```
RootLayout (Server Component)
├── ThemeProvider (Client — wraps app with theme context)
│
├── HomePage (Server Component — SSR for SEO)
│   └── PreviewDashboard (Client Component — 'use client')
│       ├── MetaInputForm
│       │   ├── Input (title) + CharacterCounter
│       │   ├── Textarea (description) + CharacterCounter
│       │   ├── Input (URL)
│       │   └── Input (keyword)
│       │
│       ├── PreviewContainer (Radix Tabs)
│       │   ├── GoogleDesktopPreview
│       │   ├── GoogleMobilePreview
│       │   ├── BingPreview
│       │   └── SocialCardPreview
│       │
│       ├── ScoreDashboard
│       │   ├── OverallScoreGauge
│       │   ├── ScoreCard (title)
│       │   ├── ScoreCard (description)
│       │   ├── ScoreCard (keyword)
│       │   └── MobileTruncationWarning
│       │
│       ├── ScreenshotButton
│       │
│       └── AffiliateRecommendation
│
├── EmbedPage (Server Component)
│   └── WidgetWrapper (Client Component — 'use client')
│       └── PreviewDashboard (compact mode)
│
└── WidgetConfigPage (Server Component)
    └── EmbedCodeGenerator (Client Component)
```

### Key Architecture Decisions

1. **PreviewDashboard is the single `'use client'` boundary** on the home page. Everything above it (layout, page shell, header, footer) is Server Component — zero JS shipped for those parts.

2. **All preview components are children of a single client boundary** — they share form state via props drilling from PreviewDashboard. No global state management library needed.

3. **Scoring is pure functions** — `src/lib/scoring.ts` has zero React dependencies. It's called synchronously during render (derived state pattern, not useEffect).

---

## 6. Data Flow

### Input → Preview → Score Flow

```
User types in MetaInputForm
  → onChange fires, updates local state in PreviewDashboard (useState)
  → State flows down as props to:
      → GoogleDesktopPreview (renders with new title/desc/url)
      → GoogleMobilePreview (renders with new title/desc/url)
      → BingPreview (renders with new title/desc/url)
      → SocialCardPreview (renders with new title/desc/url)
      → ScoreDashboard:
          → scoreTitle(title) → ScoreCard
          → scoreDescription(description) → ScoreCard
          → scoreKeywordPresence(title, desc, keyword) → ScoreCard
          → checkMobileTruncation(title, desc) → MobileTruncationWarning
          → calculateOverallScore(...) → OverallScoreGauge
```

**Performance note**: All scoring functions are pure and fast (<1ms). They run synchronously during render — no useEffect, no debouncing needed. React's reconciliation handles the 16ms frame budget.

### Screenshot Export Flow

```
User clicks ScreenshotButton
  → Dynamic import html2canvas (lazy loaded, ~200KB)
  → html2canvas captures the active preview tab's DOM node
  → Canvas is modified to add watermark (ScreenshotWatermark overlay)
  → canvas.toBlob('image/png')
  → URL.createObjectURL(blob)
  → Trigger download via hidden <a> element
  → Revoke object URL
```

### Theme Toggle Flow

```
User clicks ThemeToggle
  → useTheme hook updates state + localStorage('theme')
  → CSS class 'dark' added/removed on <html> element
  → Tailwind dark: variants activate
  → SERP previews always render in light mode (SERPs are light-themed)
```

### Widget Embed Flow

```
Blog owner visits /widget
  → EmbedCodeGenerator shows configuration options
  → User selects options (compact, showScores, etc.)
  → Embed code updates in real-time:
      <iframe src="https://[domain]/embed?compact=true&showScores=true"
              width="100%" height="600" frameborder="0"></iframe>
  → User copies code → pastes in their blog
  → iframe loads /embed page with query params
  → WidgetWrapper renders PreviewDashboard in compact mode
  → "Powered by [tool name]" link at bottom of widget
```

### History Flow (P2)

```
User completes a check (title + description filled)
  → useHistory hook saves to localStorage:
      key: 'seo-preview-history'
      value: JSON array of { title, description, url, keyword, scores, timestamp }
      max: 20 entries (FIFO)
  → HistoryPanel reads from localStorage on mount
  → User clicks history entry → form repopulates
```

---

## 7. Constants & SERP Specifications

File: `src/lib/constants.ts`

```typescript
// Google Desktop SERP
export const GOOGLE_DESKTOP = {
  titleMaxChars: 60,
  titleMaxPixels: 600, // Google truncates by pixel width, not chars
  titleFontFamily: "'Google Sans', Arial, sans-serif",
  titleFontSize: "20px",
  titleLineHeight: "26px",
  titleColor: "#1a0dab",
  titleVisitedColor: "#681da8",
  descMaxChars: 160,
  descFontFamily: "Arial, sans-serif",
  descFontSize: "14px",
  descLineHeight: "22px",
  descColor: "#4d5156",
  urlFontFamily: "Arial, sans-serif",
  urlFontSize: "14px",
  urlColor: "#188038",
  containerWidth: 600,
} as const;

// Google Mobile SERP
export const GOOGLE_MOBILE = {
  titleMaxChars: 50,
  titleFontSize: "16px",
  titleLineHeight: "20px",
  descMaxChars: 120,
  descFontSize: "12px",
  descLineHeight: "18px",
  containerWidth: 360,
} as const;

// Bing SERP
export const BING = {
  titleMaxChars: 65,
  titleFontFamily: "'Segoe UI', sans-serif",
  titleFontSize: "20px",
  titleColor: "#001ba0",
  descMaxChars: 160,
  descFontFamily: "'Segoe UI', sans-serif",
  descFontSize: "13px",
  descColor: "#505050",
  urlColor: "#006d21",
  containerWidth: 560,
} as const;

// Social Card (Facebook/LinkedIn format)
export const SOCIAL_CARD = {
  imageWidth: 1200,
  imageHeight: 630,
  titleMaxChars: 65,
  descMaxChars: 155,
  containerWidth: 500,
} as const;

// Scoring thresholds
export const SCORING = {
  title: { min: 30, optimal: 60, acceptable: 70 },
  description: { min: 120, optimal: 160, acceptable: 200 },
  mobileTitle: 50,
  mobileDescription: 120,
  weights: { title: 0.4, description: 0.4, keyword: 0.2 },
} as const;
```

---

## 8. Security Checklist

| Concern                     | Mitigation                                                                                                        | Status   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- |
| **XSS in previews**         | All user input rendered via React JSX (auto-escaped). No `dangerouslySetInnerHTML`.                               | Required |
| **XSS in embed**            | Embed page uses same React rendering. iframe sandboxed with `sandbox="allow-scripts"`.                            | Required |
| **CSRF**                    | No server mutations — no forms submit to server. All client-side.                                                 | N/A      |
| **Data privacy**            | Zero data sent to server. No cookies. No tracking pixels. localStorage only.                                      | Required |
| **CSP headers**             | Configure in `next.config.ts`: `script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:` | Required |
| **Secrets**                 | No API keys. Affiliate links are public URLs (no secrets).                                                        | N/A      |
| **iframe clickjacking**     | Main site: `X-Frame-Options: DENY`. `/embed` route: `X-Frame-Options: ALLOWALL` (intentionally embeddable).       | Required |
| **Dependency supply chain** | `npm audit` in CI. Lock file committed. Renovate/Dependabot for updates.                                          | Required |
| **Input validation**        | URL validated via `new URL()` constructor. Title/description are free text with max length (500 chars UI limit).  | Required |
| **localStorage overflow**   | History capped at 20 entries. Graceful degradation if localStorage unavailable or full.                           | Required |

### CSP Configuration in next.config.ts

```typescript
headers: async () => [
  {
    source: '/((?!embed).*)',  // All routes except /embed
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  },
  {
    source: '/embed',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // No X-Frame-Options — intentionally embeddable
    ],
  },
],
```

---

## 9. Testing Strategy

### Unit Tests (Vitest) — `src/lib/**/*.test.ts`

- All scoring functions: boundary values, edge cases, empty strings
- Truncation logic: exact character counts, pixel-width approximation
- URL validation and extraction
- History localStorage operations
- Embed code generation

### Component Tests (Vitest + RTL) — `src/components/**/*.test.tsx`

- MetaInputForm: renders, updates state, shows char counts
- Each preview component: renders correctly with sample data, truncates properly
- ScoreDashboard: displays correct colors and messages
- ScreenshotButton: triggers download
- ThemeToggle: switches theme class

### E2E Tests (Playwright) — `e2e/`

- Full flow: type title/description/URL → verify all previews update → verify scores
- Screenshot export: click download → verify file downloaded
- Mobile responsiveness: viewport resize → layout adapts
- Embed widget: load in iframe → verify functionality
- Keyboard navigation: tab through all interactive elements
- Accessibility: axe-core scan on every page

### Test File Locations

```
src/
├── lib/
│   ├── scoring.test.ts           # Unit: scoring algorithms
│   ├── truncation.test.ts        # Unit: truncation logic
│   ├── screenshot.test.ts        # Unit: screenshot generation
│   ├── history.test.ts           # Unit: localStorage operations
│   └── embed.test.ts             # Unit: embed code generation
├── components/
│   ├── input/
│   │   └── MetaInputForm.test.tsx
│   ├── preview/
│   │   ├── GoogleDesktopPreview.test.tsx
│   │   ├── GoogleMobilePreview.test.tsx
│   │   ├── BingPreview.test.tsx
│   │   └── SocialCardPreview.test.tsx
│   ├── scoring/
│   │   ├── ScoreDashboard.test.tsx
│   │   └── OverallScoreGauge.test.tsx
│   └── export/
│       └── ScreenshotButton.test.tsx
e2e/
├── main-flow.spec.ts             # Full user journey
├── previews.spec.ts              # All preview rendering
├── scoring.spec.ts               # Score display and accuracy
├── screenshot.spec.ts            # Export functionality
├── embed.spec.ts                 # Widget embedding
├── accessibility.spec.ts         # axe-core + keyboard nav
└── mobile.spec.ts                # Responsive behavior
```

---

## 10. Deployment & Infrastructure

### Vercel (Free Tier)

- **Build**: `next build` (static + server hybrid)
- **CDN**: Vercel Edge Network (automatic)
- **Domain**: Custom domain via Vercel DNS
- **Preview deploys**: Automatic on PR branches
- **Production**: Auto-deploy on `main` branch push

### Environment Variables

```env
# .env.example (already exists)
NEXT_PUBLIC_APP_URL=https://seo-meta-preview.com
NEXT_PUBLIC_AHREFS_AFFILIATE_URL=https://ahrefs.com/?ref=xxx
NEXT_PUBLIC_SEMRUSH_AFFILIATE_URL=https://semrush.com/?ref=xxx
NEXT_PUBLIC_SURFERSEO_AFFILIATE_URL=https://surferseo.com/?ref=xxx
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=seo-meta-preview.com
```

All environment variables are `NEXT_PUBLIC_` — no server secrets exist.

---

## 11. Performance Budget

| Metric             | Budget          | Enforcement                                      |
| ------------------ | --------------- | ------------------------------------------------ |
| First Load JS      | < 80KB gzipped  | `next build` output check in CI                  |
| html2canvas (lazy) | < 250KB gzipped | Dynamic import, loaded on first screenshot click |
| LCP                | < 1.5s          | Lighthouse CI                                    |
| INP                | < 100ms         | All interactions are synchronous state updates   |
| CLS                | 0               | Fonts preloaded via next/font; no layout shifts  |
| Total page weight  | < 500KB         | Including fonts, CSS, JS                         |

### Bundle Split Strategy

- **Critical path**: React + scoring logic + input form + active preview tab (~60KB)
- **Lazy loaded**: html2canvas (on screenshot click), inactive preview tabs (on tab switch), history panel (on toggle)
- **Server-only**: OG image generation route (never in client bundle)
