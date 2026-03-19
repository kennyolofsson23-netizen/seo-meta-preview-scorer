'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type ProgressStatus = 'good' | 'warning' | 'error'

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  status?: ProgressStatus
  label?: string
  showValue?: boolean
}

function ProgressBar({
  value,
  status = 'good',
  label,
  showValue = false,
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  const fillColor = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }[status]

  return (
    <div className={cn('w-full', className)} {...props}>
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progress: ${clampedValue}%`}
        className="h-2 w-full rounded-full bg-muted overflow-hidden"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', fillColor)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground mt-1">{clampedValue}%</span>
      )}
    </div>
  )
}

export { ProgressBar }
