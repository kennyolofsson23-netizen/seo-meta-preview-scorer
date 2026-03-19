/**
 * BingPreview – F005
 * Pixel-perfect Bing SERP preview with Bing-specific styling and truncation.
 * Presentation-only component; no internal state.
 */

import React from "react";
import { BING } from "@/lib/constants";
import { extractDomain } from "@/lib/scoring";

export interface BingPreviewProps {
  title: string;
  description: string;
  url: string;
  keyword?: string;
}

/**
 * Truncate a string at `maxChars`, appending "…" when truncated.
 */
function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + "…";
}

/**
 * Split `text` on `keyword` (case-insensitive) and wrap each match in
 * a <strong> element for bolding.
 */
function highlightKeyword(text: string, keyword: string): React.ReactNode {
  if (!keyword.trim()) return text;

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <strong key={i}>{part}</strong>
    ) : (
      part
    ),
  );
}

export function BingPreview({
  title,
  description,
  url,
  keyword,
}: BingPreviewProps) {
  // --- Title ---
  const rawTitle = title.trim();
  const displayTitle = rawTitle ? truncate(rawTitle, BING.titleMaxChars) : null;

  // --- URL display (Bing shows the full URL) ---
  const displayUrl = url.trim() || "example.com";

  // --- Description ---
  const rawDesc = description.trim();
  const displayDesc = rawDesc ? truncate(rawDesc, BING.descMaxChars) : null;

  return (
    <div
      role="region"
      aria-label="Bing search result preview"
      className="max-w-[600px] bg-white dark:bg-[#1B1B1B] rounded p-3"
      data-testid="bing-preview"
    >
      {/* Title */}
      <div>
        <a
          href={url.trim() || "#"}
          className="hover:underline text-[#001ba0] dark:text-[#8AB4F8]"
          style={{
            fontFamily: BING.titleFontFamily,
            fontSize: BING.titleFontSize,
            textDecoration: "none",
          }}
          data-testid="bing-title"
        >
          {displayTitle ? (
            keyword ? (
              highlightKeyword(displayTitle, keyword)
            ) : (
              displayTitle
            )
          ) : (
            <em style={{ color: "#767676" }}>Untitled</em>
          )}
        </a>
      </div>

      {/* URL */}
      <div
        className="text-xs mt-0.5"
        style={{ color: BING.urlColor, fontFamily: BING.titleFontFamily }}
        data-testid="bing-url"
      >
        {displayUrl}
      </div>

      {/* Description */}
      {displayDesc && (
        <p
          className="mt-1"
          style={{
            fontFamily: BING.descFontFamily,
            fontSize: BING.descFontSize,
            color: BING.descColor,
            margin: "4px 0 0",
          }}
          data-testid="bing-description"
        >
          {keyword ? highlightKeyword(displayDesc, keyword) : displayDesc}
        </p>
      )}
    </div>
  );
}

export default BingPreview;
