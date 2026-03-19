'use client'

import * as React from 'react'
import { type PageMetadata } from '@/types'
import { type ScoringResult } from '@/lib/scoring'
import { type MobileTruncation } from '@/lib/hooks/useMetaInput'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { CharacterCounter } from './CharacterCounter'
import { SCORING } from '@/lib/constants'

// Title: optimal 30-60 chars, warning 61-70, error otherwise
const TITLE_OPTIMAL_MIN = SCORING.title.min       // 30
const TITLE_OPTIMAL = SCORING.title.optimal       // 60
const TITLE_MAX = SCORING.title.acceptable        // 70

// Description: optimal 120-160 chars, warning 161-200, error otherwise
const DESC_OPTIMAL_MIN = SCORING.description.min  // 120
const DESC_OPTIMAL = SCORING.description.optimal  // 160
const DESC_MAX = SCORING.description.acceptable   // 200

export interface MetaInputFormProps {
  metadata: PageMetadata
  onChange: (metadata: PageMetadata) => void
  titleScore: ScoringResult
  descriptionScore: ScoringResult
  keywordScore: ScoringResult
  urlValidation: { valid: boolean; error?: string }
  mobileTruncation: MobileTruncation
}

function FieldProgress({
  value,
  max,
  status,
  score,
}: {
  value: number
  max: number
  status: 'good' | 'warning' | 'error'
  score: number
}) {
  const barColor =
    status === 'good'
      ? 'bg-green-500'
      : status === 'warning'
        ? 'bg-yellow-500'
        : 'bg-red-500'

  const width = `${Math.min(100, (value / max) * 100)}%`

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="h-2 flex-1 rounded-full overflow-hidden bg-muted">
        <div
          className={`h-full transition-all duration-150 ${barColor}`}
          style={{ width }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground tabular-nums w-10 text-right">
        {score}%
      </span>
    </div>
  )
}

export function MetaInputForm({
  metadata,
  onChange,
  titleScore,
  descriptionScore,
  keywordScore,
  urlValidation,
  mobileTruncation,
}: MetaInputFormProps) {
  function handleTitleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange({ ...metadata, title: e.target.value })
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange({ ...metadata, description: e.target.value })
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...metadata, url: e.target.value })
  }

  function handleKeywordChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...metadata, keyword: e.target.value })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
      {/* Mobile truncation banner */}
      {mobileTruncation.hasIssues && (
        <div
          role="alert"
          className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700 px-4 py-2 text-xs text-yellow-800 dark:text-yellow-300"
        >
          {mobileTruncation.titleTruncated && mobileTruncation.descriptionTruncated
            ? 'Your title and description will be truncated on mobile search results.'
            : mobileTruncation.titleTruncated
              ? 'Your title will be truncated on mobile search results (limit: 50 chars).'
              : 'Your description will be truncated on mobile search results (limit: 120 chars).'}
        </div>
      )}

      {/* Title field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="meta-title"
            className="block text-sm font-medium text-foreground"
          >
            Page Title
          </label>
          <CharacterCounter
            count={metadata.title.length}
            optimalMin={TITLE_OPTIMAL_MIN}
            optimal={TITLE_OPTIMAL}
            max={TITLE_MAX}
          />
        </div>
        <Textarea
          id="meta-title"
          rows={2}
          value={metadata.title}
          onChange={handleTitleChange}
          placeholder="Enter your page title..."
          aria-describedby="meta-title-message"
        />
        <FieldProgress
          value={metadata.title.length}
          max={TITLE_OPTIMAL}
          status={titleScore.status}
          score={titleScore.score}
        />
        <p
          id="meta-title-message"
          className="text-xs text-muted-foreground mt-1"
        >
          {titleScore.message}
        </p>
      </div>

      {/* Description field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="meta-description"
            className="block text-sm font-medium text-foreground"
          >
            Meta Description
          </label>
          <CharacterCounter
            count={metadata.description.length}
            optimalMin={DESC_OPTIMAL_MIN}
            optimal={DESC_OPTIMAL}
            max={DESC_MAX}
          />
        </div>
        <Textarea
          id="meta-description"
          rows={3}
          value={metadata.description}
          onChange={handleDescriptionChange}
          placeholder="Enter your meta description..."
          aria-describedby="meta-description-message"
        />
        <FieldProgress
          value={metadata.description.length}
          max={DESC_OPTIMAL}
          status={descriptionScore.status}
          score={descriptionScore.score}
        />
        <p
          id="meta-description-message"
          className="text-xs text-muted-foreground mt-1"
        >
          {descriptionScore.message}
        </p>
      </div>

      {/* URL field */}
      <div>
        <label
          htmlFor="meta-url"
          className="block text-sm font-medium text-foreground mb-1"
        >
          URL
        </label>
        <Input
          id="meta-url"
          type="url"
          value={metadata.url}
          onChange={handleUrlChange}
          placeholder="https://example.com/page"
          aria-describedby={!urlValidation.valid ? 'meta-url-error' : undefined}
          aria-invalid={!urlValidation.valid}
          className={!urlValidation.valid ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {!urlValidation.valid && urlValidation.error && (
          <p
            id="meta-url-error"
            className="text-xs text-red-600 dark:text-red-400 mt-1"
            role="alert"
          >
            {urlValidation.error}
          </p>
        )}
      </div>

      {/* Keyword field */}
      <div>
        <label
          htmlFor="meta-keyword"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Primary Keyword{' '}
          <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>
        <Input
          id="meta-keyword"
          type="text"
          value={metadata.keyword ?? ''}
          onChange={handleKeywordChange}
          placeholder="e.g., 'SEO tips', 'how to optimize'"
          aria-describedby="meta-keyword-message"
        />
        <FieldProgress
          value={keywordScore.score}
          max={100}
          status={keywordScore.status}
          score={keywordScore.score}
        />
        <p
          id="meta-keyword-message"
          className="text-xs text-muted-foreground mt-1"
        >
          {keywordScore.message}
        </p>
      </div>
    </div>
  )
}
