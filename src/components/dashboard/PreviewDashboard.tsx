"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { LayoutDashboard, History, BarChart3, Code2 } from "lucide-react";
import { useMetaInput } from "@/lib/hooks/useMetaInput";
import { useHistory } from "@/lib/hooks/useHistory";
import { MetaInputForm } from "@/components/input/MetaInputForm";
import { UrlFetchButton } from "@/components/input/UrlFetchButton";
import { ScoreDashboard } from "@/components/scoring/ScoreDashboard";
import { PreviewContainer } from "@/components/preview/PreviewContainer";
import { AffiliateRecommendation } from "@/components/affiliate/AffiliateRecommendation";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { BulkCheckPanel } from "@/components/bulk/BulkCheckPanel";
import { EmbedCodeGenerator } from "@/components/embed/EmbedCodeGenerator";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "@/lib/history";

export function PreviewDashboard() {
  const {
    metadata,
    setMetadata,
    titleScore,
    descriptionScore,
    keywordScore,
    overall,
    urlValidation,
    mobileTruncation,
  } = useMetaInput();

  const { save } = useHistory();

  // Save to history whenever metadata changes and has meaningful content
  const saveToHistory = () => {
    if (metadata.title.trim() || metadata.description.trim()) {
      save({
        title: metadata.title,
        description: metadata.description,
        url: metadata.url,
        keyword: metadata.keyword ?? "",
        overallScore: overall,
      });
    }
  };

  function handleHistorySelect(entry: HistoryEntry) {
    setMetadata({
      title: entry.title,
      description: entry.description,
      url: entry.url,
      keyword: entry.keyword,
    });
  }

  return (
    <RadixTabs.Root defaultValue="checker" className="space-y-0">
      {/* Main navigation tabs */}
      <RadixTabs.List
        className="flex border-b border-border bg-card rounded-t-lg overflow-x-auto"
        aria-label="Main sections"
      >
        {[
          { value: "checker", label: "Checker", icon: LayoutDashboard },
          { value: "history", label: "History", icon: History },
          { value: "bulk", label: "Bulk Check", icon: BarChart3 },
          { value: "embed", label: "Embed", icon: Code2 },
        ].map(({ value, label, icon: Icon }) => (
          <RadixTabs.Trigger
            key={value}
            value={value}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              "text-muted-foreground hover:text-foreground",
              "data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {/* ─── CHECKER TAB ──────────────────────────────────────────────────── */}
      <RadixTabs.Content value="checker" className="focus-visible:outline-none">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Left column: input */}
          <div className="space-y-4">
            {/* URL fetch button */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium mb-3">Auto-fill from URL</p>
              <UrlFetchButton
                url={metadata.url}
                onFetch={(fetched) => {
                  setMetadata({
                    ...metadata,
                    title: fetched.title || metadata.title,
                    description: fetched.description || metadata.description,
                    ogTitle: fetched.ogTitle || undefined,
                    ogDescription: fetched.ogDescription || undefined,
                    ogImage: fetched.ogImage || undefined,
                  });
                }}
              />
            </div>

            {/* Input form */}
            <MetaInputForm
              metadata={metadata}
              onChange={(updated) => {
                setMetadata(updated);
              }}
              titleScore={titleScore}
              descriptionScore={descriptionScore}
              keywordScore={keywordScore}
              urlValidation={urlValidation}
              mobileTruncation={mobileTruncation}
            />

            {/* Save to history button */}
            <button
              onClick={saveToHistory}
              className="w-full rounded-md border border-border bg-muted/30 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Save to History
            </button>

            {/* Affiliate recommendations */}
            <AffiliateRecommendation
              keywordScore={keywordScore.score}
              overallScore={overall}
            />
          </div>

          {/* Right column: scores + previews */}
          <div className="space-y-6">
            {/* Score dashboard */}
            <ScoreDashboard
              title={metadata.title}
              description={metadata.description}
              keyword={metadata.keyword ?? ""}
            />

            {/* Preview container */}
            <PreviewContainer
              title={metadata.title}
              description={metadata.description}
              url={metadata.url}
              keyword={metadata.keyword}
              ogImage={metadata.ogImage}
              ogTitle={metadata.ogTitle}
              ogDescription={metadata.ogDescription}
            />
          </div>
        </div>
      </RadixTabs.Content>

      {/* ─── HISTORY TAB ──────────────────────────────────────────────────── */}
      <RadixTabs.Content
        value="history"
        className="focus-visible:outline-none rounded-b-lg border border-t-0 border-border bg-card p-6"
      >
        <HistoryPanel onSelect={handleHistorySelect} />
      </RadixTabs.Content>

      {/* ─── BULK CHECK TAB ───────────────────────────────────────────────── */}
      <RadixTabs.Content
        value="bulk"
        className="focus-visible:outline-none rounded-b-lg border border-t-0 border-border bg-card p-6"
      >
        <BulkCheckPanel />
      </RadixTabs.Content>

      {/* ─── EMBED TAB ────────────────────────────────────────────────────── */}
      <RadixTabs.Content
        value="embed"
        className="focus-visible:outline-none rounded-b-lg border border-t-0 border-border bg-card p-6"
      >
        <EmbedCodeGenerator />
      </RadixTabs.Content>
    </RadixTabs.Root>
  );
}
