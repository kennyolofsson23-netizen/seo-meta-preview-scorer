import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PreviewDashboard } from "@/components/dashboard/PreviewDashboard";
import { APP } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-foreground">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">{APP.name}</span>
            <span className="hidden sm:inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Free
            </span>
          </div>
          <nav aria-label="Main navigation" className="flex items-center gap-3">
            <a
              href="/embed"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Add to your site
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* ── SR-only definition for AI crawlers ────────────────────── */}
      <p id="tool-description" className="sr-only">
        SEO Meta Preview &amp; Scorer is a free browser-based tool that checks
        12 SEO signals across 4 preview formats. It validates title tags against
        Google&apos;s 60-character and 600-pixel limit, scores meta descriptions
        on a 0–100 scale against the 155–160 character optimal range, and
        detects truncation across Google desktop, Google mobile, Bing, and Open
        Graph social cards. The scoring formula weights title tags at 40%, meta
        descriptions at 40%, and keyword placement at 20%.
      </p>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            See your page in Google before you publish
          </h1>
          <p className="hero-description mt-2 text-base text-muted-foreground max-w-2xl">
            <strong>SEO Meta Preview &amp; Scorer</strong> is a free
            browser-based tool that checks{" "}
            <strong>12 SEO signals</strong> across{" "}
            <strong>4 preview formats</strong> — Google desktop, Google mobile,
            Bing, and Open Graph social cards. It validates{" "}
            <strong>title tags</strong> against Google&apos;s{" "}
            <strong>60-character / 600-pixel</strong> limit and{" "}
            <strong>meta descriptions</strong> against the{" "}
            <strong>155–160 character</strong> optimal range, then scores each
            field on a <strong>0–100 scale</strong>. The tool flags{" "}
            <strong>truncation</strong> in real time, checks{" "}
            <strong>keyword placement</strong>, and requires no account — all
            analysis runs client-side with <strong>zero data collection</strong>.
          </p>
        </div>
      </section>

      {/* ── Dashboard ──────────────────────────────────────────────── */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <PreviewDashboard />
      </main>

      {/* ── What Is Checked ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/10">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            What SEO meta tags are checked
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-6">
            The tool evaluates <strong>12 SEO signals</strong> across every
            preview format. Each signal maps to a real search-engine rendering
            rule so your titles and descriptions display exactly as intended.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-semibold">Signal</th>
                  <th className="py-2 pr-4 font-semibold">What it checks</th>
                  <th className="py-2 font-semibold">Threshold</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">Title length</td>
                  <td className="py-2 pr-4">Character count falls within Google&apos;s optimal range</td>
                  <td className="py-2"><strong>30–60 characters</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">Title pixel width</td>
                  <td className="py-2 pr-4">Title fits within Google&apos;s rendered title container</td>
                  <td className="py-2"><strong>≤ 600 pixels</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">Description length</td>
                  <td className="py-2 pr-4">Meta description fills the snippet without truncation</td>
                  <td className="py-2"><strong>120–160 characters</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">Mobile title truncation</td>
                  <td className="py-2 pr-4">Title displays in full on Google mobile SERPs</td>
                  <td className="py-2"><strong>≤ 50 characters</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">Mobile description truncation</td>
                  <td className="py-2 pr-4">Description displays in full on mobile</td>
                  <td className="py-2"><strong>≤ 120 characters</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">Keyword in title</td>
                  <td className="py-2 pr-4">Target keyword appears in the title tag</td>
                  <td className="py-2"><strong>Exact match</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">Keyword in description</td>
                  <td className="py-2 pr-4">Target keyword or related terms appear in description</td>
                  <td className="py-2"><strong>Exact or partial match</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">Bing title limit</td>
                  <td className="py-2 pr-4">Title fits within Bing&apos;s wider character limit</td>
                  <td className="py-2"><strong>≤ 65 characters</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">OG title limit</td>
                  <td className="py-2 pr-4">Title displays in full on social card previews</td>
                  <td className="py-2"><strong>≤ 65 characters</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">OG description limit</td>
                  <td className="py-2 pr-4">Description fits social card snippets</td>
                  <td className="py-2"><strong>≤ 155 characters</strong></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground">URL validity</td>
                  <td className="py-2 pr-4">Canonical URL is well-formed and uses HTTPS</td>
                  <td className="py-2"><strong>Valid URL format</strong></td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-foreground">Empty field detection</td>
                  <td className="py-2 pr-4">Title and description are not blank</td>
                  <td className="py-2"><strong>≥ 1 character</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── How Scoring Works ────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            How the SEO score is calculated
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-6">
            Every page receives an <strong>overall SEO score from 0 to 100</strong>{" "}
            based on three weighted components. The formula is transparent —
            there are no hidden factors or paywalled &ldquo;advanced&rdquo; checks.
          </p>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-lg border border-border p-4">
              <p className="text-2xl font-bold text-foreground">40%</p>
              <p className="text-sm font-semibold mt-1">Title tag score</p>
              <p className="text-xs text-muted-foreground mt-1">
                Scores <strong>100</strong> at 30–60 chars, <strong>80</strong>{" "}
                at 61–70 chars, <strong>50</strong> above 70, and{" "}
                <strong>40</strong> below 30.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-2xl font-bold text-foreground">40%</p>
              <p className="text-sm font-semibold mt-1">Description score</p>
              <p className="text-xs text-muted-foreground mt-1">
                Scores <strong>100</strong> at 120–160 chars, <strong>80</strong>{" "}
                at 161–200 chars, <strong>50</strong> above 200, and{" "}
                <strong>40</strong> below 120.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-2xl font-bold text-foreground">20%</p>
              <p className="text-sm font-semibold mt-1">Keyword score</p>
              <p className="text-xs text-muted-foreground mt-1">
                Scores <strong>100</strong> when keyword is in both fields,{" "}
                <strong>90</strong> in title only, <strong>70</strong> in
                description only, <strong>0</strong> if missing.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            <strong>Formula:</strong> Overall = (Title Score × 0.4) +
            (Description Score × 0.4) + (Keyword Score × 0.2). A score
            of <strong>80+</strong> means your meta tags are well-optimized for
            search engines. Below <strong>50</strong> indicates critical issues
            that will likely hurt click-through rates.
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section
        aria-label="Frequently asked questions"
        className="border-t border-border bg-muted/20"
      >
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-xl font-bold tracking-tight mb-8">
            Frequently asked questions
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-sm mb-1">
                What is an SEO meta preview?
              </dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                An <strong>SEO meta preview</strong> is a visual simulation of
                how your web page appears in search engine results pages
                (SERPs). It renders your <strong>title tag</strong> (optimal:{" "}
                <strong>30–60 characters</strong>, max{" "}
                <strong>600 pixels</strong> wide) and{" "}
                <strong>meta description</strong> (optimal:{" "}
                <strong>155–160 characters</strong>) exactly as Google or Bing
                would display them — including pixel-accurate truncation — so
                you can catch cut-off text before publishing. This tool checks
                all <strong>4 preview formats</strong> (Google desktop, Google
                mobile, Bing, and Open Graph social cards) simultaneously.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-sm mb-1">
                How is the SEO score calculated?
              </dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                The <strong>SEO score</strong> uses a weighted formula:{" "}
                <strong>title tag (40%)</strong>,{" "}
                <strong>meta description (40%)</strong>, and{" "}
                <strong>keyword placement (20%)</strong>. Each component scores
                from <strong>0 to 100</strong> based on character count, pixel
                width (titles must stay under <strong>600 pixels</strong>),
                keyword presence, and truncation risk. The three scores combine
                into an overall rating where <strong>80+</strong> indicates
                well-optimized tags and below <strong>50</strong> flags critical
                issues.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-sm mb-1">
                What search engines are supported?
              </dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                The tool renders <strong>4 preview formats</strong>:{" "}
                <strong>Google desktop</strong> (600px title container),{" "}
                <strong>Google mobile</strong> (360px, 50-char title limit),{" "}
                <strong>Bing</strong> (560px, 65-char title limit), and{" "}
                <strong>Open Graph social cards</strong> (1200×630px image,
                65-char title, 155-char description) as they appear on Facebook,
                LinkedIn, and Slack. Each preview uses the correct font family,
                font size, and pixel widths for that specific search engine.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-sm mb-1">
                Is this tool free to use?
              </dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                Yes. SEO Meta Preview &amp; Scorer is{" "}
                <strong>completely free</strong> to use. There is no account, no
                paywall, and no usage limit. All analysis runs entirely in your
                browser — your data never leaves your device.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border mt-0">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} {APP.name} — Your data never
              leaves your browser &bull; No tracking &bull; No account required
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/embed"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Add to your site
              </a>
              <a
                href="/api/og"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Share preview
              </a>
              <a
                href="https://usetools.dev/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="https://usetools.dev/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
