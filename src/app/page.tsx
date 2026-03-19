import { PreviewDashboard } from '@/components/dashboard/PreviewDashboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            SEO Meta Preview & Scorer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            See exactly how your pages appear in Google, Bing, and social media. Score your SEO metadata in real-time.
          </p>
        </div>

        {/* Main Dashboard */}
        <PreviewDashboard />

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>Built with ❤️ for content creators and SEO professionals</p>
            <p className="mt-2">
              Zero API calls • 100% client-side • Real-time scoring
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
