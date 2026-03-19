'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  readHistory,
  saveHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
  type HistoryEntry,
} from '@/lib/history'
import { isBrowser } from '@/lib/utils'

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    if (!isBrowser()) return
    try {
      // Test localStorage availability
      localStorage.setItem('__test__', '1')
      localStorage.removeItem('__test__')
      setIsAvailable(true)
      setHistory(readHistory())
    } catch {
      setIsAvailable(false)
    }
  }, [])

  const save = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
      if (!isAvailable) return
      const saved = saveHistoryEntry(entry)
      if (saved) {
        setHistory(readHistory())
      }
    },
    [isAvailable]
  )

  const remove = useCallback(
    (id: string) => {
      if (!isAvailable) return
      deleteHistoryEntry(id)
      setHistory(readHistory())
    },
    [isAvailable]
  )

  const clear = useCallback(() => {
    if (!isAvailable) return
    clearHistory()
    setHistory([])
  }, [isAvailable])

  return {
    history,
    isAvailable,
    save,
    remove,
    clear,
  }
}
