/**
 * History management for SEO checks
 * Stores last 20 checks in localStorage
 */

import { HISTORY } from '@/lib/constants'

export interface HistoryEntry {
  id: string
  title: string
  description: string
  url: string
  keyword: string
  overallScore: number
  timestamp: number // Unix timestamp ms
}

/**
 * Read history from localStorage
 * Returns empty array if localStorage unavailable or data is corrupt
 */
export function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY.storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

/**
 * Save a history entry (prepends to front, trims to max 20 entries)
 */
export function saveHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>
): HistoryEntry | null {
  try {
    const existing = readHistory()
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    }

    // Remove duplicates with same title+description+url
    const deduplicated = existing.filter(
      (e) =>
        !(
          e.title === entry.title &&
          e.description === entry.description &&
          e.url === entry.url
        )
    )

    const updated = [newEntry, ...deduplicated].slice(0, HISTORY.maxEntries)
    localStorage.setItem(HISTORY.storageKey, JSON.stringify(updated))
    return newEntry
  } catch {
    return null
  }
}

/**
 * Delete a history entry by ID
 */
export function deleteHistoryEntry(id: string): void {
  try {
    const existing = readHistory()
    const updated = existing.filter((e) => e.id !== id)
    localStorage.setItem(HISTORY.storageKey, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY.storageKey)
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Format a timestamp for display
 */
export function formatHistoryDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
