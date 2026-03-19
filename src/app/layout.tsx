import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SEO Meta Preview & Scorer',
  description:
    'See exactly how your pages appear in Google, Bing, and social media previews. Score your SEO metadata in real-time with zero API calls.',
  keywords: ['SEO', 'meta preview', 'SERP', 'scoring', 'title', 'description', 'Google preview'],
  authors: [{ name: 'SEO Meta Preview' }],
  creator: 'SEO Meta Preview',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'SEO Meta Preview & Scorer',
    description:
      'Pixel-perfect SEO preview and real-time scoring tool. Free, zero API calls, 100% client-side.',
    siteName: 'SEO Meta Preview & Scorer',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/og`,
        width: 1200,
        height: 630,
        alt: 'SEO Meta Preview & Scorer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Meta Preview & Scorer',
    description: 'See how your pages appear in search results. Free, zero API calls.',
  },
}

// Inline script to prevent FOUC (flash of unstyled content) for dark mode
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('seo-theme');
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Prevent FOUC for dark mode */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <noscript>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md m-4">
            This tool requires JavaScript to run.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  )
}
