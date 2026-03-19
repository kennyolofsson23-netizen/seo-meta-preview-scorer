import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SEO Meta Preview & Scorer — Free SERP Preview Tool",
  description:
    "See exactly how your pages appear in Google, Bing, and social results before publishing. Pixel-perfect SERP previews for desktop and mobile, plus real-time SEO scoring — 100% free, zero tracking.",
  keywords: [
    "SERP preview tool",
    "SEO meta preview",
    "title tag checker",
    "meta description checker",
    "Google preview",
    "Bing preview",
    "social card preview",
    "OG tags",
    "SEO scoring",
    "meta tags",
  ],
  authors: [{ name: "SEO Meta Preview & Scorer" }],
  creator: "SEO Meta Preview & Scorer",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "SEO Meta Preview & Scorer — Free SERP Preview Tool",
    description:
      "Paste your title and meta description. Get pixel-perfect Google, Bing, and social previews plus a real-time SEO score — all client-side, no signup required.",
    siteName: "SEO Meta Preview & Scorer",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/og`,
        width: 1200,
        height: 630,
        alt: "SEO Meta Preview & Scorer — pixel-perfect SERP preview and real-time SEO scoring tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Meta Preview & Scorer — Free SERP Preview Tool",
    description:
      "See how your page looks in Google before you publish. Pixel-perfect previews for desktop, mobile, Bing, and social — plus real-time SEO scoring. Free, no signup.",
  },
};

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
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            SEO Meta Preview &amp; Scorer requires JavaScript. Please enable it
            in your browser settings to use the tool.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
