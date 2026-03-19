"use client";

import React from "react";
import {
  truncateGoogleDesktopTitle,
  truncateGoogleDesktopDescription,
  highlightKeyword,
  formatGoogleBreadcrumb,
  type TextSegment,
} from "@/lib/truncation";

interface GoogleDesktopPreviewProps {
  title: string;
  description: string;
  url: string;
  keyword?: string;
}

function KeywordHighlighted({ segments }: { segments: TextSegment[] }) {
  return (
    <>
      {segments.map((segment, i) =>
        segment.isKeyword ? (
          <strong key={i}>{segment.text}</strong>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}

export function GoogleDesktopPreview({
  title,
  description,
  url,
  keyword = "",
}: GoogleDesktopPreviewProps) {
  const displayTitle = title || "";
  const displayDescription = description || "";

  const truncatedTitle = truncateGoogleDesktopTitle(displayTitle);
  const truncatedDescription =
    truncateGoogleDesktopDescription(displayDescription);

  const titleSegments = keyword
    ? highlightKeyword(truncatedTitle, keyword)
    : [{ text: truncatedTitle, isKeyword: false }];
  const descSegments = keyword
    ? highlightKeyword(truncatedDescription, keyword)
    : [{ text: truncatedDescription, isKeyword: false }];

  const { domain, breadcrumb } = formatGoogleBreadcrumb(url);

  return (
    <div
      aria-label="Google search result preview"
      className="max-w-[600px] bg-white rounded p-3 font-sans"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Favicon + URL row */}
      <div className="flex items-center gap-2 mb-1">
        {/* Favicon placeholder */}
        <div
          className="w-4 h-4 rounded-full bg-[#E8EAED] flex-shrink-0"
          aria-hidden="true"
        />
        <div
          className="text-sm leading-none"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          <span className="text-[#202124]">{domain}</span>
          {breadcrumb && (
            <span className="text-[#202124]"> › {breadcrumb}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className="cursor-pointer hover:underline leading-snug mb-1"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "20px",
          color: "#1A0DAB",
          fontWeight: 400,
          lineHeight: "26px",
        }}
      >
        {displayTitle ? (
          <KeywordHighlighted segments={titleSegments} />
        ) : (
          <em style={{ color: "#999", fontStyle: "italic" }}>Untitled</em>
        )}
      </h3>

      {/* Description */}
      {displayDescription && (
        <p
          className="leading-snug mt-0.5"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            color: "#4D5156",
            lineHeight: "22px",
          }}
        >
          <KeywordHighlighted segments={descSegments} />
        </p>
      )}
    </div>
  );
}
