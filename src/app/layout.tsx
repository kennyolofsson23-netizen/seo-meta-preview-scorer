import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SEO Meta Preview & Scorer',
  description: 'See exactly how your pages appear in Google, Bing, and social media previews. Score your SEO metadata in real-time with zero API calls.',
  keywords: ['SEO', 'meta preview', 'SERP', 'scoring', 'title', 'description'],
  authors: [{ name: 'SEO Tools' }],
  creator: 'SEO Tools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'SEO Meta Preview & Scorer',
    description: 'Pixel-perfect SEO preview and scoring tool',
    siteName: 'SEO Meta Preview & Scorer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Meta Preview & Scorer',
    description: 'See how your pages appear in search results',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
