/**
 * SERP and scoring constants
 * Pixel-accurate specifications for Google Desktop, Google Mobile, Bing, and Social Card
 */

// Google Desktop SERP
export const GOOGLE_DESKTOP = {
  titleMaxChars: 60,
  titleMaxPixels: 600,
  titleFontFamily: "Arial, sans-serif",
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
  urlColor: "#006621",
  containerWidth: 600,
} as const;

// Google Mobile SERP
export const GOOGLE_MOBILE = {
  titleMaxChars: 50,
  titleFontSize: "16px",
  titleLineHeight: "20px",
  titleColor: "#1a0dab",
  descMaxChars: 120,
  descFontSize: "12px",
  descLineHeight: "18px",
  descColor: "#4d5156",
  urlColor: "#006621",
  containerWidth: 360,
} as const;

// Bing SERP
export const BING = {
  titleMaxChars: 65,
  titleFontFamily: "'Segoe UI', Arial, sans-serif",
  titleFontSize: "20px",
  titleColor: "#001ba0",
  descMaxChars: 160,
  descFontFamily: "'Segoe UI', Arial, sans-serif",
  descFontSize: "13px",
  descColor: "#767676",
  urlColor: "#006400",
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

// App metadata
export const APP = {
  name: "SEO Meta Preview & Scorer",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://seo-meta-preview.vercel.app",
  description:
    "Preview your meta tags in Google, Bing, and social media — then score and fix them before you publish.",
} as const;

// Affiliate URLs
export const AFFILIATES = {
  ahrefs: process.env.NEXT_PUBLIC_AHREFS_AFFILIATE_URL ?? "https://ahrefs.com",
  semrush:
    process.env.NEXT_PUBLIC_SEMRUSH_AFFILIATE_URL ?? "https://semrush.com",
  surferSeo:
    process.env.NEXT_PUBLIC_SURFERSEO_AFFILIATE_URL ?? "https://surferseo.com",
} as const;

// History config
export const HISTORY = {
  storageKey: "seo-preview-history",
  maxEntries: 20,
} as const;

// Theme config
export const THEME = {
  storageKey: "seo-theme",
} as const;

// Example/placeholder values for empty state
// Chosen to score 100/100: title 46 chars, description 153 chars, keyword appears in both
export const EXAMPLES = {
  title: "How to Write Meta Descriptions That Get Clicks",
  description:
    "Write meta descriptions that earn more clicks — learn the right length, structure, and tone that Google actually rewards, with before-and-after examples.",
  url: "https://yourblog.com/meta-description-guide",
  keyword: "meta description",
} as const;
