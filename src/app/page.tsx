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

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            See your page in Google before you publish
          </h1>
          <p className="hero-description mt-2 text-base text-muted-foreground max-w-2xl">
            <strong>SEO Meta Preview &amp; Scorer</strong> is a free
            browser-based tool for <strong>SEO professionals</strong>,
            developers, and content teams. It renders pixel-accurate previews of{" "}
            <strong>title tags</strong> and <strong>meta descriptions</strong>{" "}
            as they appear in Google desktop, Google mobile, Bing, and Open
            Graph social cards. The tool scores each field against current SEO
            guidelines, flags <strong>truncation</strong> in real time, and
            requires no account or server-side processing — all analysis runs
            client-side.
          </p>
        </div>
      </section>

      {/* ── Dashboard ──────────────────────────────────────────────── */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <PreviewDashboard />
      </main>

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
                (SERPs). It renders your <strong>title tag</strong> and{" "}
                <strong>meta description</strong> exactly as Google or Bing
                would display them — including pixel-accurate truncation at
                character limits — so you can catch cut-off text before
                publishing.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-sm mb-1">
                How is the SEO score calculated?
              </dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                The <strong>SEO score</strong> is calculated client-side by
                evaluating your title tag and meta description against current
                best-practice guidelines. It checks character count, pixel
                width, keyword placement, uniqueness signals, and truncation
                risk. Each field receives an individual score that combines into
                an overall rating from 0–100.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-sm mb-1">
                What search engines are supported?
              </dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                The tool supports <strong>Google desktop</strong>,{" "}
                <strong>Google mobile</strong>, and <strong>Bing</strong> SERP
                previews. It also renders{" "}
                <strong>Open Graph social card</strong> previews as they appear
                on platforms like Facebook, LinkedIn, and Slack. Each preview
                uses the correct font metrics and pixel widths for that specific
                search engine.
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
