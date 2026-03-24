import type { Metadata } from "next";
import Script from "next/script";
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
    "Preview your title and meta description in Google, Bing, and social cards. Real-time SEO scoring, truncation detection — free, no signup.",
  alternates: {
    canonical: "https://seo-meta-preview-scorer.usetools.dev",
  },
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

// Static JSON-LD structured data — no user input, XSS risk is zero
const webAppJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SEO Meta Preview & Scorer",
  description:
    "See exactly how your pages appear in Google, Bing, and social results before publishing. Pixel-perfect SERP previews for desktop and mobile, plus real-time SEO scoring — 100% free, zero tracking.",
  url: "https://seo-meta-preview-scorer.usetools.dev",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Google desktop and mobile SERP preview",
    "Bing SERP preview",
    "Open Graph social card preview",
    "Real-time SEO scoring",
    "Truncation detection",
    "Embeddable widget",
    "No signup required",
  ],
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".hero-description"],
  },
});

const organizationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "usetools.dev",
  url: "https://usetools.dev",
  sameAs: ["https://github.com/kennyolofsson23-netizen"],
});

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an SEO meta preview?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An SEO meta preview is a visual simulation of how your web page appears in search engine results pages (SERPs). It renders your title tag and meta description exactly as Google or Bing would display them, including pixel-accurate truncation at character limits. This lets you catch cut-off text before publishing.",
      },
    },
    {
      "@type": "Question",
      name: "How is the SEO score calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The SEO score is calculated client-side by evaluating your title tag and meta description against current best-practice guidelines. It checks character count, pixel width (titles should stay under ~600px), keyword placement, uniqueness signals, and truncation risk. Each field receives an individual score that combines into an overall rating from 0–100.",
      },
    },
    {
      "@type": "Question",
      name: "What search engines are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SEO Meta Preview & Scorer supports Google desktop, Google mobile, and Bing SERP previews. It also renders Open Graph social card previews as they appear on platforms like Facebook, LinkedIn, and Slack. Each preview uses the correct font metrics and pixel widths for that specific search engine.",
      },
    },
    {
      "@type": "Question",
      name: "Is this tool free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. SEO Meta Preview & Scorer is completely free to use. There is no account, no paywall, and no usage limit. All analysis runs entirely in your browser — your data never leaves your device.",
      },
    },
  ],
});

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
        {/* JSON-LD structured data — static content, no XSS risk */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: webAppJsonLd }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />
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
        {process.env.NODE_ENV === "production" && (
          <Script
            defer
            data-domain="usetools.dev"
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
