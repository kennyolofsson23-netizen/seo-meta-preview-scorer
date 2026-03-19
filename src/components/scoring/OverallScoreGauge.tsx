'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/Card'

export interface OverallScoreGaugeProps {
  overall: number
}

function getScoreColor(score: number): { text: string; bar: string } {
  if (score >= 80) {
    return { text: 'text-green-600 dark:text-green-500', bar: 'bg-green-500' }
  }
  if (score >= 50) {
    return { text: 'text-yellow-600 dark:text-yellow-500', bar: 'bg-yellow-500' }
  }
  return { text: 'text-red-600 dark:text-red-500', bar: 'bg-red-500' }
}

export function OverallScoreGauge({ overall }: OverallScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(overall)))
  const { text: scoreColor, bar: barColor } = getScoreColor(clamped)

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Overall SEO Score</h2>
          <div>
            <span className={`text-5xl font-bold ${scoreColor}`}>{clamped}</span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
        </div>
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall SEO score: ${clamped} out of 100`}
          className="h-4 bg-muted rounded-full overflow-hidden"
        >
          <div
            className={`h-full transition-all duration-300 ease-out ${barColor}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Title 40% · Description 40% · Keyword 20%
        </p>
      </CardContent>
    </Card>
  )
}
