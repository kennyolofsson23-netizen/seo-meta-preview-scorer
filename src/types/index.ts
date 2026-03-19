/**
 * SEO Meta Preview & Scorer Type Definitions
 */

/**
 * Meta information for a page
 */
export interface PageMetadata {
  title: string
  description: string
  url: string
  keyword?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
}

/**
 * Individual score result
 */
export interface ScoreResult {
  score: number
  status: 'good' | 'warning' | 'error'
  message: string
}

/**
 * Complete SEO scoring breakdown
 */
export interface SeoScores {
  title: ScoreResult
  description: ScoreResult
  keyword: ScoreResult
  overall: number
}

/**
 * Preview rendering options
 */
export interface PreviewOptions {
  device: 'desktop' | 'mobile'
  theme: 'light' | 'dark'
}

/**
 * Screenshot configuration
 */
export interface ScreenshotConfig {
  format: 'png' | 'jpg'
  quality: number
  scale: number
}

/**
 * Widget embedding options
 */
export interface WidgetOptions {
  embedId: string
  defaultTitle?: string
  defaultDescription?: string
  defaultUrl?: string
  showScores?: boolean
  showPreviews?: boolean
  compactMode?: boolean
}

/**
 * Shareable preview state
 */
export interface ShareablePreview {
  id: string
  title: string
  description: string
  url: string
  scores: SeoScores
  createdAt: Date
  expiresAt?: Date
}
