"use client";

import * as React from "react";
import { type PageMetadata } from "@/types";
import { type ScoringResult } from "@/lib/scoring";
import { type MobileTruncation } from "@/lib/hooks/useMetaInput";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CharacterCounter } from "./CharacterCounter";
import { SCORING } from "@/lib/constants";

// Title: optimal 30-60 chars, warning 61-70, error otherwise
const TITLE_OPTIMAL_MIN = SCORING.title.min; // 30
const TITLE_OPTIMAL = SCORING.title.optimal; // 60
const TITLE_MAX = SCORING.title.acceptable; // 70

// Description: optimal 120-160 chars, warning 161-200, error otherwise
const DESC_OPTIMAL_MIN = SCORING.description.min; // 120
const DESC_OPTIMAL = SCORING.description.optimal; // 160
const DESC_MAX = SCORING.description.acceptable; // 200

export interface MetaInputFormProps {
  metadata: PageMetadata;
  onChange: (metadata: PageMetadata) => void;
  titleScore: ScoringResult;
  descriptionScore: ScoringResult;
  keywordScore: ScoringResult;
  urlValidation: { valid: boolean; error?: string };
  mobileTruncation: MobileTruncation;
}

function FieldProgress({
  value,
  max,
  status,
  score,
  label,
}: {
  value: number;
  max: number;
  status: "good" | "warning" | "error";
  score: number;
  label: string;
}) {
  const barColor =
    status === "good"
      ? "bg-green-500"
      : status === "warning"
        ? "bg-yellow-500"
        : "bg-red-500";

  const width = `${Math.min(100, (value / max) * 100)}%`;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="h-2 flex-1 rounded-full overflow-hidden bg-muted">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground tabular-nums w-10 text-right">
        {score}%
      </span>
    </div>
  );
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
    onChange({ ...metadata, title: e.target.value });
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange({ ...metadata, description: e.target.value });
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...metadata, url: e.target.value });
  }

  function handleKeywordChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...metadata, keyword: e.target.value });
  }

  return (
    <div
      role="form"
      aria-label="SEO metadata input form"
      className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4"
    >
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
          placeholder="e.g. 10 SEO Mistakes That Kill Your Traffic (And How to Fix Them)"
          aria-describedby="meta-title-message"
        />
        <FieldProgress
          value={metadata.title.length}
          max={TITLE_OPTIMAL}
          status={titleScore.status}
          score={titleScore.score}
          label={`Title score: ${titleScore.score} out of 100`}
        />
        {mobileTruncation.titleTruncated && (
          <p
            className="text-xs text-yellow-700 dark:text-yellow-400 mt-1"
            role="alert"
          >
            ⚠ Title too long for mobile — will be cut off after 50 characters.
          </p>
        )}
        <p
          id="meta-title-message"
          aria-live="polite"
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
          placeholder="e.g. Learn how to write compelling meta descriptions that improve click-through rates from search results. We cover length, tone, and real examples."
          aria-describedby="meta-description-message"
        />
        <FieldProgress
          value={metadata.description.length}
          max={DESC_OPTIMAL}
          status={descriptionScore.status}
          score={descriptionScore.score}
          label={`Description score: ${descriptionScore.score} out of 100`}
        />
        {mobileTruncation.descriptionTruncated && (
          <p
            className="text-xs text-yellow-700 dark:text-yellow-400 mt-1"
            role="alert"
          >
            ⚠ Description too long for mobile — will be cut off after 120
            characters.
          </p>
        )}
        <p
          id="meta-description-message"
          aria-live="polite"
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
          Page URL
        </label>
        <Input
          id="meta-url"
          type="url"
          value={metadata.url}
          onChange={handleUrlChange}
          placeholder="https://yoursite.com/page-slug"
          aria-describedby={!urlValidation.valid ? "meta-url-error" : undefined}
          aria-invalid={!urlValidation.valid}
          className={
            !urlValidation.valid ? "border-red-500 focus:ring-red-500" : ""
          }
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
          Target Keyword{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          id="meta-keyword"
          type="text"
          value={metadata.keyword ?? ""}
          onChange={handleKeywordChange}
          placeholder="e.g. meta description tips"
          aria-describedby="meta-keyword-message"
        />
        <FieldProgress
          value={keywordScore.score}
          max={100}
          status={keywordScore.status}
          score={keywordScore.score}
          label={`Keyword score: ${keywordScore.score} out of 100`}
        />
        <p
          id="meta-keyword-message"
          aria-live="polite"
          className="text-xs text-muted-foreground mt-1"
        >
          {keywordScore.message}
        </p>
      </div>
    </div>
  );
}
