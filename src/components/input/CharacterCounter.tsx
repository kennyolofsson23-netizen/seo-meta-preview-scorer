"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CharacterCounterProps {
  count: number;
  optimal: number; // upper bound of green range
  max: number; // upper bound of yellow range; above this is red
  optimalMin?: number; // lower bound of green range (defaults to 0)
}

/**
 * Displays character count with color coding:
 *   green  — count is within the optimal range [optimalMin, optimal]
 *   yellow — count is in the warning range [optimal+1, max]
 *   red    — count is outside both ranges (< optimalMin if provided, or > max)
 */
export function CharacterCounter({
  count,
  optimal,
  max,
  optimalMin = 0,
}: CharacterCounterProps) {
  const colorClass = React.useMemo(() => {
    if (count >= optimalMin && count <= optimal) {
      return "text-green-600 dark:text-green-400";
    }
    if (count > optimal && count <= max) {
      return "text-yellow-600 dark:text-yellow-400";
    }
    return "text-red-600 dark:text-red-400";
  }, [count, optimal, max, optimalMin]);

  return (
    <span
      className={cn("text-xs font-medium tabular-nums", colorClass)}
      aria-live="polite"
      aria-label={`${count} characters`}
    >
      ({count} chars)
    </span>
  );
}
