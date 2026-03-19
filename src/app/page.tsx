import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PreviewDashboard } from "@/components/dashboard/PreviewDashboard";
import { APP } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">{APP.name}</span>
            <span className="hidden sm:inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Free
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="/embed"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Embed on Your Site
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See how your page looks in Google — before you publish
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl">
            Paste your title and description to get pixel-perfect previews for
            Google desktop, Google mobile, Bing, and social cards. Get an
            instant SEO score with specific fixes. Free, no signup, nothing sent
            to a server.
          </p>
        </div>
      </section>

      {/* ── Dashboard ──────────────────────────────────────────────── */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <PreviewDashboard />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} {APP.name} &mdash; Zero API
              calls &bull; No tracking &bull; 100% client-side
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/embed"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Add to Your Site
              </a>
              <a
                href="/api/og"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                OG Image API
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
