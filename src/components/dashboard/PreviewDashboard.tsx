'use client'

import { useState } from 'react'
import { type PageMetadata } from '@/types'
import {
  scoreTitle,
  scoreDescription,
  scoreKeywordPresence,
  calculateOverallScore,
  validateUrl,
} from '@/lib/scoring'

export function PreviewDashboard() {
  const [metadata, setMetadata] = useState<PageMetadata>({
    title: 'Example Page Title | My Website',
    description: 'This is an example meta description that helps visitors understand what your page is about in search results.',
    url: 'https://example.com/sample-page',
    keyword: 'example page',
  })

  // Calculate scores
  const titleScore = scoreTitle(metadata.title)
  const descriptionScore = scoreDescription(metadata.description)
  const keywordScore = scoreKeywordPresence(
    metadata.title,
    metadata.description,
    metadata.keyword || ''
  )
  const overall = calculateOverallScore(
    titleScore.score,
    descriptionScore.score,
    keywordScore.score
  )

  const urlValidation = validateUrl(metadata.url)

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
          Enter Your Page Information
        </h2>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Page Title
              <span className="text-slate-400 ml-1">({metadata.title.length} chars)</span>
            </label>
            <textarea
              id="title"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              placeholder="Enter your page title..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows={2}
            />
            <div className="mt-2">
              <div className="flex gap-2">
                <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      titleScore.status === 'good'
                        ? 'bg-green-500'
                        : titleScore.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (metadata.title.length / 60) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {titleScore.score}%
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {titleScore.message}
              </p>
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Meta Description
              <span className="text-slate-400 ml-1">({metadata.description.length} chars)</span>
            </label>
            <textarea
              id="description"
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              placeholder="Enter your meta description..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows={3}
            />
            <div className="mt-2">
              <div className="flex gap-2">
                <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      descriptionScore.status === 'good'
                        ? 'bg-green-500'
                        : descriptionScore.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (metadata.description.length / 160) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {descriptionScore.score}%
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {descriptionScore.message}
              </p>
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL
            </label>
            <input
              id="url"
              type="url"
              value={metadata.url}
              onChange={(e) => setMetadata({ ...metadata, url: e.target.value })}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {!urlValidation.valid && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {urlValidation.error}
              </p>
            )}
          </div>

          {/* Keyword Input */}
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Primary Keyword (Optional)
            </label>
            <input
              id="keyword"
              type="text"
              value={metadata.keyword || ''}
              onChange={(e) => setMetadata({ ...metadata, keyword: e.target.value })}
              placeholder="e.g., 'SEO tips', 'how to optimize'"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <div className="mt-2">
              <div className="flex gap-2">
                <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      keywordScore.status === 'good'
                        ? 'bg-green-500'
                        : keywordScore.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${keywordScore.score}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {keywordScore.score}%
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {keywordScore.message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Overall SEO Score
          </h2>
          <div className="text-5xl font-bold">
            <span
              className={
                overall >= 80
                  ? 'text-green-600'
                  : overall >= 50
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }
            >
              {overall}
            </span>
            <span className="text-2xl text-slate-400">/100</span>
          </div>
        </div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              overall >= 80
                ? 'bg-green-500'
                : overall >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      {/* Preview Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          Preview
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p>Preview components will be built in the next phase of development.</p>
          <p className="mt-2">
            This will include Google SERP preview, Bing preview, and social card preview.
          </p>
        </div>
      </div>
    </div>
  )
}
