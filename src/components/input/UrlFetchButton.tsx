"use client";

import * as React from "react";
import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface FetchedMetadata {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export interface UrlFetchButtonProps {
  url: string;
  onFetch: (metadata: FetchedMetadata) => void;
  disabled?: boolean;
}

export function UrlFetchButton({
  url,
  onFetch,
  disabled = false,
}: UrlFetchButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isDisabled = disabled || loading || !url.trim();

  async function handleFetch() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/fetch-meta?url=${encodeURIComponent(url)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Couldn't fetch that URL — try entering your meta tags manually.",
        );
        return;
      }

      onFetch({
        title: data.title ?? "",
        description: data.description ?? "",
        ogTitle: data.ogTitle ?? "",
        ogDescription: data.ogDescription ?? "",
        ogImage: data.ogImage ?? "",
      });
    } catch {
      setError("Connection error. Enter your title and description manually.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleFetch}
        disabled={isDisabled}
        aria-label={
          loading ? "Importing metadata from URL…" : "Import meta tags from a live URL"
        }
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Globe className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        {loading ? "Importing…" : "Import from URL"}
      </Button>

      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
