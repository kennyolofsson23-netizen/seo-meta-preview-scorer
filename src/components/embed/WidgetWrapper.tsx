"use client";

import { useMetaInput } from "@/lib/hooks/useMetaInput";
import { MetaInputForm } from "@/components/input/MetaInputForm";
import { ScoreDashboard } from "@/components/scoring/ScoreDashboard";
import { PreviewContainer } from "@/components/preview/PreviewContainer";
import type { WidgetOptions } from "@/types";
import { cn } from "@/lib/utils";

export interface WidgetWrapperProps {
  options?: Partial<WidgetOptions>;
}

/**
 * Compact, self-contained widget for embedding via iframe.
 * Renders a stripped-down version of the tool inside /embed.
 */
export function WidgetWrapper({ options = {} }: WidgetWrapperProps) {
  const {
    metadata,
    setMetadata,
    titleScore,
    descriptionScore,
    keywordScore,
    overall,
    urlValidation,
    mobileTruncation,
  } = useMetaInput({
    title: options.defaultTitle,
    description: options.defaultDescription,
    url: options.defaultUrl,
  });

  const showScores = options.showScores !== false;
  const showPreviews = options.showPreviews !== false;
  const compact = options.compactMode === true;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-background text-foreground p-4",
        compact ? "min-h-[450px]" : "min-h-[700px]",
      )}
    >
      {/* Compact header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          SEO Meta Checker
        </span>
        {showScores && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded",
              overall >= 80
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : overall >= 50
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            )}
          >
            SEO Score: {overall}/100
          </span>
        )}
      </div>

      {/* Input form */}
      <MetaInputForm
        metadata={metadata}
        onChange={setMetadata}
        titleScore={titleScore}
        descriptionScore={descriptionScore}
        keywordScore={keywordScore}
        urlValidation={urlValidation}
        mobileTruncation={mobileTruncation}
      />

      {/* Scores */}
      {showScores && !compact && (
        <ScoreDashboard
          title={metadata.title}
          description={metadata.description}
          keyword={metadata.keyword ?? ""}
        />
      )}

      {/* Previews */}
      {showPreviews && (
        <PreviewContainer
          title={metadata.title}
          description={metadata.description}
          url={metadata.url}
          keyword={metadata.keyword}
          ogImage={metadata.ogImage}
          ogTitle={metadata.ogTitle}
          ogDescription={metadata.ogDescription}
        />
      )}
    </div>
  );
}
