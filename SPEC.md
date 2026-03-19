# SEO Meta Preview & Scorer — Product Specification

## 1. Product Overview

### Problem

Every blogger, content creator, and SEO professional needs to preview how their pages appear in search results **before publishing**. Currently, they either:

- Publish and wait for Google to index (slow, risky)
- Use fragmented free tools that only show Google desktop preview (no Bing, no social, no scoring)
- Pay for full SEO suites ($99–299/mo) when they only need the preview feature

### Solution

A free, instant, zero-API-call tool that renders pixel-perfect SERP previews (Google desktop + mobile, Bing, social/OG card) and scores metadata quality with actionable feedback. Runs 100% client-side — no server round-trips, no rate limits, no data collection.

### Target Users

1. **Bloggers & content creators** writing 2-10 posts/month who optimize titles and descriptions before publishing
2. **SEO professionals & consultants** auditing client pages and generating shareable reports
3. **SEO/content marketing blog owners** who want an embeddable widget to drive backlinks and traffic

### Differentiators vs. Competitors

| Feature                   | Mangools SERP Sim | metatags.io  | Portent SERP | **This Tool**      |
| ------------------------- | ----------------- | ------------ | ------------ | ------------------ |
| Google desktop preview    | ✅                | ✅           | ✅           | ✅                 |
| Google mobile preview     | ❌                | ❌           | ❌           | ✅                 |
| Bing preview              | ❌                | ❌           | ❌           | ✅                 |
| Social/OG card preview    | ❌                | ✅ (partial) | ❌           | ✅                 |
| Real-time scoring         | ❌                | ❌           | Basic        | ✅ (comprehensive) |
| Keyword presence check    | ❌                | ❌           | ❌           | ✅                 |
| Mobile truncation warning | ❌                | ❌           | ❌           | ✅                 |
| Screenshot export         | ❌                | ❌           | ❌           | ✅                 |
| Embeddable widget         | ❌                | ❌           | ❌           | ✅                 |
| Zero API calls            | ✅                | ❌           | ✅           | ✅                 |
| Dark mode                 | ❌                | ❌           | ❌           | ✅                 |

---

## 2. User Personas

### Persona 1: Sarah — Freelance Content Creator

- **Role**: Writes 5-8 blog posts/month for clients
- **Goals**: Optimize titles and descriptions for CTR before publishing; show clients "here's how your post will look in Google"
- **Frustrations**: Current tools only show desktop; clients ask "what about mobile?"; can't export a screenshot to share in Slack
- **Usage pattern**: Uses the tool 10-15 times/week, typically spending <60 seconds per check

### Persona 2: Marcus — SEO Consultant

- **Role**: Manages SEO for 12 client websites
- **Goals**: Audit meta tags across client sites; generate quick visual reports; check keyword placement in titles/descriptions
- **Frustrations**: Paid tools are overkill for a quick preview check; needs to show clients visual proof of issues
- **Usage pattern**: Uses the tool 20-30 times/week during audits, exports screenshots for client reports

### Persona 3: Priya — SEO Blog Owner

- **Role**: Runs a content marketing blog with 50K monthly visitors
- **Goals**: Embed useful tools in blog posts to drive engagement and backlinks; monetize via affiliate programs
- **Frustrations**: Most embeddable tools are ugly or broken; needs a widget that matches her site's design
- **Usage pattern**: Embeds the widget once; her readers use it hundreds of times/month

---

## 3. Core Features

### P0 — Must Ship (Launch Blockers)

#### F001: Meta Input Form

**User Story**: As a content creator, I want to paste my page title, meta description, and URL so I can preview how they appear in search results.

**Acceptance Criteria**:

- Given the input form is displayed, when a user types in the title field, then the character count updates in real-time
- Given the input form is displayed, when a user types in the description field, then the character count updates in real-time
- Given a URL is entered, when it is invalid, then a validation error message appears below the field
- Given all fields are empty, when the page loads, then placeholder example values are shown in the previews
- Given the user types in any field, when the input changes, then all previews update within 16ms (single frame)

#### F002: Google SERP Preview (Desktop)

**User Story**: As a content creator, I want to see a pixel-perfect Google desktop search result preview so I know exactly how my page will appear.

**Acceptance Criteria**:

- Given a title, description, and URL are entered, when the Google preview renders, then the title appears as a blue clickable link in Google's exact font (Google Sans / Arial, 20px)
- Given a URL is entered, when the preview renders, then the URL appears in green text with breadcrumb format matching Google's current SERP style
- Given a title longer than 60 characters, when the preview renders, then the title is visually truncated with an ellipsis at the pixel-accurate cutoff point
- Given a description longer than 160 characters, when the preview renders, then the description is truncated with "..." matching Google's behavior
- Given a keyword is entered, when it appears in the title or description, then it is displayed in bold in the preview (matching Google's keyword bolding)

#### F003: Google SERP Preview (Mobile)

**User Story**: As a content creator, I want to see how my page appears in Google mobile search results since >60% of searches happen on mobile.

**Acceptance Criteria**:

- Given a title is entered, when the mobile preview renders, then the title truncates at ~50 characters (matching Google mobile behavior)
- Given a description is entered, when the mobile preview renders, then the description truncates at ~120 characters
- Given the mobile preview is displayed, when rendered, then it uses mobile-width container (360px) with Google's mobile SERP styling
- Given the mobile preview is active, when compared to desktop preview, then font sizes and spacing match Google's actual mobile SERP

#### F004: SEO Score Dashboard

**User Story**: As an SEO professional, I want to see a comprehensive score breakdown so I can identify and fix metadata issues.

**Acceptance Criteria**:

- Given a title is entered, when scored, then the title score shows green (30-60 chars), yellow (61-70 chars), or red (<30 or >70 chars) with specific feedback
- Given a description is entered, when scored, then the description score shows green (120-160 chars), yellow (161-200 chars), or red (<120 or >200 chars)
- Given a keyword is entered, when checked, then the keyword presence score indicates whether it appears in title, description, both, or neither
- Given title and description are entered, when mobile truncation is checked, then a warning appears if title >50 chars or description >120 chars
- Given all scores are calculated, when the overall score displays, then it is a weighted average (title 40%, description 40%, keyword 20%) shown as 0-100 with color coding

#### F005: Bing SERP Preview

**User Story**: As a content creator, I want to see how my page appears in Bing search results since Bing powers ~10% of search traffic and DuckDuckGo.

**Acceptance Criteria**:

- Given a title, description, and URL are entered, when the Bing preview renders, then the styling matches Bing's current SERP (Segoe UI font, different blue shade, different URL format)
- Given a title longer than 65 characters, when the Bing preview renders, then it truncates at Bing's cutoff point (which differs from Google)
- Given a description is entered, when the Bing preview renders, then it truncates at ~160 characters matching Bing's behavior

#### F006: Social/OG Card Preview

**User Story**: As a content creator, I want to preview how my page looks when shared on social media (Facebook, Twitter/X, LinkedIn).

**Acceptance Criteria**:

- Given OG title and description are entered (or fall back to regular title/description), when the social card renders, then it shows a large card format with image placeholder, title, description, and domain
- Given no OG image URL is provided, when the preview renders, then a placeholder with dimensions (1200x630) and "Add OG Image URL" prompt is shown
- Given an OG image URL is provided, when valid, then the image loads in the preview card
- Given the social card is displayed, when rendered, then it matches the Facebook/LinkedIn large card format (title below image, description below title, domain at bottom)

### P1 — Should Ship (Week 2)

#### F007: Screenshot Export

**User Story**: As an SEO consultant, I want to export a screenshot of any preview so I can share it with clients or on social media.

**Acceptance Criteria**:

- Given any preview tab is active, when the user clicks "Download Screenshot", then a PNG image of the preview is downloaded
- Given the screenshot is generated, when downloaded, then the image includes only the preview area (not the input form or scores)
- Given the screenshot is generated, when downloaded, then a small watermark "Generated by [tool name] — [URL]" appears at the bottom
- Given the download button is clicked, when generating, then a loading spinner shows and completes within 2 seconds

#### F008: Embeddable Widget

**User Story**: As an SEO blog owner, I want to embed this tool on my blog so my readers can use it and it generates backlinks to my tool.

**Acceptance Criteria**:

- Given the embed page is visited, when the user clicks "Get Embed Code", then a copyable HTML snippet is displayed
- Given the embed code is pasted into any website, when the page loads, then a compact version of the tool renders in an iframe
- Given the widget is embedded, when rendered, then it includes a "Powered by [tool name]" link that opens in a new tab
- Given the widget is embedded, when rendered, then it is responsive (min-width 320px, max-width 100%)
- Given the widget is embedded, when a user interacts with it, then previews and scores work identically to the main tool

#### F009: Dark Mode

**User Story**: As a user, I want to toggle between light and dark mode so the tool is comfortable to use in any lighting.

**Acceptance Criteria**:

- Given the tool loads, when the user's system preference is dark mode, then the tool renders in dark mode by default
- Given the tool is in light mode, when the user clicks the theme toggle, then all UI elements switch to dark mode within 100ms
- Given dark mode is active, when SERP previews render, then Google/Bing previews show in their light theme (since SERPs are always light)
- Given the user toggles theme, when they revisit the tool, then their preference is persisted via localStorage

### P2 — Nice to Have (Post-Launch)

#### F010: History / Recent Checks

**User Story**: As a content creator, I want to see my recent checks so I can compare different title/description variations.

**Acceptance Criteria**:

- Given the user has performed at least one check, when they view history, then the last 20 checks are listed with title, score, and timestamp
- Given history exists, when the user clicks a history entry, then the form repopulates with that entry's data
- Given history is stored, when stored, then it uses localStorage (no server, no account required)
- Given localStorage is full or disabled, when the tool loads, then it degrades gracefully with no history shown

#### F011: Bulk Check (CSV Upload)

**User Story**: As an SEO consultant, I want to upload a CSV of titles/descriptions to score them all at once.

**Acceptance Criteria**:

- Given a CSV file with columns "title", "description", "url", when uploaded, then all rows are scored and results displayed in a table
- Given the CSV has up to 500 rows, when processed, then all rows complete within 5 seconds
- Given bulk results are displayed, when the user clicks "Export Results", then a CSV with scores and feedback downloads

#### F012: URL Fetch (Auto-populate from Live Page)

**User Story**: As an SEO professional, I want to paste a URL and have the tool automatically fetch the page's current title and meta description.

**Acceptance Criteria**:

- Given a URL is entered in the fetch field, when the user clicks "Fetch", then the title, description, and OG data are extracted and populated
- Given the fetch is in progress, when loading, then a spinner and "Fetching..." indicator appears
- Given the URL cannot be fetched (CORS, timeout), when the error occurs, then a clear error message appears suggesting manual entry

---

## 4. Non-Functional Requirements

### Performance

- **First Contentful Paint**: < 1.5 seconds on 3G connection
- **Time to Interactive**: < 2.5 seconds
- **Input-to-preview latency**: < 16ms (single animation frame)
- **Total JS bundle**: < 100KB gzipped (excluding html2canvas which lazy-loads)
- **Lighthouse Performance score**: ≥ 95

### Browser Support

- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- iOS Safari 15+, Chrome Android 90+
- Graceful degradation for older browsers (tool works, screenshots may not)

### Accessibility

- WCAG 2.2 Level AA compliance
- Full keyboard navigation
- Screen reader compatible (ARIA labels on all interactive elements)
- Color contrast ≥ 4.5:1 for all text
- Focus visible styles on all interactive elements

### Security

- No data transmission — all processing is client-side
- No cookies, no tracking, no analytics (except privacy-respecting analytics like Plausible, optional)
- CSP headers configured
- No user accounts, no PII collection

### SEO (Meta — the tool must practice what it preaches)

- Server-rendered landing page with full meta tags
- Structured data (WebApplication schema)
- Open Graph and Twitter Card meta tags
- Sitemap and robots.txt
- Core Web Vitals all green

---

## 5. Monetization Model

### Primary: Affiliate Programs (Recurring Commissions)

- **Ahrefs**: 20% recurring commission — "Want deeper keyword data? Try Ahrefs" CTA after keyword check
- **Semrush**: Up to 40% recurring commission — "Full site audit? Try Semrush" CTA in score dashboard
- **SurferSEO**: 25% recurring commission — "Optimize full content? Try SurferSEO" CTA
- **Placement**: Non-intrusive contextual recommendations in the score results area. Never in the preview area.

### Secondary: Embeddable Widget Backlinks

- Every embedded widget includes "Powered by [tool name]" dofollow link
- At scale (100+ embeds on SEO blogs), this generates significant domain authority and organic traffic

### Tertiary: Premium Features (Future, Post-Traction)

- Bulk CSV check (>50 rows)
- Custom branding on screenshots
- API access for programmatic checks
- White-label widget (remove branding)

---

## 6. Success Metrics

| Metric                       | Target (Month 1) | Target (Month 6) |
| ---------------------------- | ---------------- | ---------------- |
| Monthly active users         | 1,000            | 25,000           |
| Checks performed/month       | 5,000            | 150,000          |
| Avg session duration         | > 2 min          | > 2 min          |
| Screenshot exports/month     | 200              | 10,000           |
| Widget embeds                | 5                | 100              |
| Affiliate click-through rate | 2%               | 3%               |
| Lighthouse Performance       | ≥ 95             | ≥ 95             |
| WCAG violations              | 0                | 0                |

---

## 7. Out of Scope for V1

- User accounts / authentication
- Server-side data storage / database
- API endpoints for programmatic access
- Browser extension
- WordPress / CMS plugins
- Competitor SERP comparison
- SERP feature previews (featured snippets, knowledge panels, site links)
- Multi-language SERP previews
- AI-powered title/description suggestions
- Backlink analysis or domain authority scoring
- Real-time Google index status checking
- Bulk CSV processing (P2 — post-launch)
- URL auto-fetch (P2 — post-launch, requires server-side proxy for CORS)
