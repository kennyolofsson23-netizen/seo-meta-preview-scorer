/**
 * BingPreview – F005 tests
 * Covers: title truncation at 65 chars, description truncation at 160 chars,
 * URL rendered in green, empty-title fallback, and keyword bolding.
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BingPreview } from './BingPreview'
import { BING } from '@/lib/constants'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeStr(len: number, char = 'A') {
  return char.repeat(len)
}

// ─── suite ──────────────────────────────────────────────────────────────────

describe('BingPreview (F005)', () => {
  // ── Title truncation ───────────────────────────────────────────────────────

  describe('title truncation', () => {
    it('renders titles within 65 chars unchanged', () => {
      const title = makeStr(65)
      render(
        <BingPreview title={title} description="" url="https://example.com" />
      )
      expect(screen.getByTestId('bing-title')).toHaveTextContent(title)
    })

    it('truncates titles longer than 65 chars with an ellipsis', () => {
      const long = makeStr(80)
      render(
        <BingPreview title={long} description="" url="https://example.com" />
      )
      const el = screen.getByTestId('bing-title')
      // Rendered text must end with the ellipsis character
      expect(el.textContent).toMatch(/…$/)
      // Visible text must not exceed titleMaxChars + 1 (the ellipsis char)
      expect(el.textContent!.length).toBeLessThanOrEqual(BING.titleMaxChars + 1)
    })

    it('truncation cutoff is at 65 characters (Bing differs from Google)', () => {
      const title = makeStr(70)
      render(
        <BingPreview title={title} description="" url="https://example.com" />
      )
      const text = screen.getByTestId('bing-title').textContent!
      // The non-ellipsis portion should be exactly 65 chars
      const withoutEllipsis = text.replace(/…$/, '')
      expect(withoutEllipsis.length).toBe(BING.titleMaxChars)
    })
  })

  // ── Description truncation ─────────────────────────────────────────────────

  describe('description truncation', () => {
    it('renders descriptions within 160 chars unchanged', () => {
      const desc = makeStr(160)
      render(
        <BingPreview title="Title" description={desc} url="https://example.com" />
      )
      expect(screen.getByTestId('bing-description')).toHaveTextContent(desc)
    })

    it('truncates descriptions longer than 160 chars with an ellipsis', () => {
      const long = makeStr(200)
      render(
        <BingPreview title="Title" description={long} url="https://example.com" />
      )
      const el = screen.getByTestId('bing-description')
      expect(el.textContent).toMatch(/…$/)
      expect(el.textContent!.length).toBeLessThanOrEqual(BING.descMaxChars + 1)
    })

    it('truncation cutoff is at 160 characters', () => {
      const desc = makeStr(180)
      render(
        <BingPreview title="Title" description={desc} url="https://example.com" />
      )
      const text = screen.getByTestId('bing-description').textContent!
      const withoutEllipsis = text.replace(/…$/, '')
      expect(withoutEllipsis.length).toBe(BING.descMaxChars)
    })
  })

  // ── URL display ────────────────────────────────────────────────────────────

  describe('URL display', () => {
    it('renders the full URL (Bing does not use breadcrumb format)', () => {
      const url = 'https://www.example.com/some/deep/path?q=1'
      render(<BingPreview title="Title" description="Desc" url={url} />)
      expect(screen.getByTestId('bing-url')).toHaveTextContent(url)
    })

    it('applies the Bing URL green color', () => {
      render(
        <BingPreview title="Title" description="Desc" url="https://example.com" />
      )
      const urlEl = screen.getByTestId('bing-url')
      expect(urlEl).toHaveStyle({ color: BING.urlColor })
    })

    it('falls back to "example.com" when url is empty', () => {
      render(<BingPreview title="Title" description="Desc" url="" />)
      expect(screen.getByTestId('bing-url')).toHaveTextContent('example.com')
    })
  })

  // ── Empty-state: title ─────────────────────────────────────────────────────

  describe('empty title', () => {
    it('shows "Untitled" in italic when title is empty', () => {
      render(<BingPreview title="" description="Some desc" url="https://example.com" />)
      const titleEl = screen.getByTestId('bing-title')
      expect(titleEl).toHaveTextContent('Untitled')
      // The fallback is wrapped in an <em>
      expect(titleEl.querySelector('em')).not.toBeNull()
    })

    it('shows "Untitled" when title contains only whitespace', () => {
      render(
        <BingPreview title="   " description="Some desc" url="https://example.com" />
      )
      expect(screen.getByTestId('bing-title')).toHaveTextContent('Untitled')
    })
  })

  // ── Empty-state: description ───────────────────────────────────────────────

  describe('empty description', () => {
    it('renders nothing for the description when it is empty', () => {
      render(<BingPreview title="Title" description="" url="https://example.com" />)
      expect(screen.queryByTestId('bing-description')).toBeNull()
    })
  })

  // ── Keyword bolding ────────────────────────────────────────────────────────

  describe('keyword bolding', () => {
    it('wraps keyword matches in <strong> within the title', () => {
      render(
        <BingPreview
          title="Best SEO Tips for beginners"
          description="Learn SEO today"
          url="https://example.com"
          keyword="SEO"
        />
      )
      const titleEl = screen.getByTestId('bing-title')
      const strong = titleEl.querySelector('strong')
      expect(strong).not.toBeNull()
      expect(strong!.textContent).toBe('SEO')
    })

    it('wraps keyword matches in <strong> within the description', () => {
      render(
        <BingPreview
          title="Some Title"
          description="Learn SEO strategies for your site"
          url="https://example.com"
          keyword="SEO"
        />
      )
      const descEl = screen.getByTestId('bing-description')
      const strong = descEl.querySelector('strong')
      expect(strong).not.toBeNull()
      expect(strong!.textContent).toBe('SEO')
    })

    it('matches keyword case-insensitively', () => {
      render(
        <BingPreview
          title="best seo tips"
          description="seo is important"
          url="https://example.com"
          keyword="SEO"
        />
      )
      const titleEl = screen.getByTestId('bing-title')
      expect(titleEl.querySelector('strong')).not.toBeNull()
    })

    it('does not bold when keyword is not provided', () => {
      render(
        <BingPreview
          title="Best SEO Tips"
          description="Learn SEO today"
          url="https://example.com"
        />
      )
      expect(screen.getByTestId('bing-title').querySelector('strong')).toBeNull()
      expect(screen.getByTestId('bing-description').querySelector('strong')).toBeNull()
    })
  })

  // ── Styling spot-checks ────────────────────────────────────────────────────

  describe('Bing-specific styling', () => {
    it('uses Segoe UI font family for the title', () => {
      render(
        <BingPreview title="My Title" description="Desc" url="https://example.com" />
      )
      const titleEl = screen.getByTestId('bing-title')
      expect(titleEl).toHaveStyle({ fontFamily: BING.titleFontFamily })
    })

    it('uses Bing title color #001ba0', () => {
      render(
        <BingPreview title="My Title" description="Desc" url="https://example.com" />
      )
      expect(screen.getByTestId('bing-title')).toHaveStyle({
        color: BING.titleColor,
      })
    })

    it('uses Bing description color #767676', () => {
      render(
        <BingPreview title="Title" description="My description" url="https://example.com" />
      )
      expect(screen.getByTestId('bing-description')).toHaveStyle({
        color: BING.descColor,
      })
    })
  })
})
