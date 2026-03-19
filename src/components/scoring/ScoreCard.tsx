"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

export interface ScoreCardProps {
  label: string;
  score: number;
  status: "good" | "warning" | "error";
  message: string;
  charCount?: number;
  charLimit?: number;
}

const statusLabel: Record<ScoreCardProps["status"], string> = {
  good: "Optimal",
  warning: "Improve",
  error: "Fix It",
};

export function ScoreCard({
  label,
  score,
  status,
  message,
  charCount,
  charLimit,
}: ScoreCardProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Badge variant={status}>{statusLabel[status]}</Badge>
        </div>
        <ProgressBar
          value={clamped}
          status={status}
          label={`${label} score: ${clamped}%`}
          className="mb-2"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground flex-1 pr-2">{message}</p>
          {charCount !== undefined && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {charCount}
              {charLimit !== undefined ? `/${charLimit}` : ""} chars
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
