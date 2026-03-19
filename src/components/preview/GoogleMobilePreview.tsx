"use client";

import React from "react";
import {
  truncateGoogleMobileTitle,
  truncateGoogleMobileDescription,
  highlightKeyword,
  formatGoogleBreadcrumb,
  type TextSegment,
} from "@/lib/truncation";

interface GoogleMobilePreviewProps {
  title: string;
  description: string;
  url: string;
  keyword?: string;
  /** When true, wraps in a phone frame chrome */
  showPhoneFrame?: boolean;
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

function MobileSerpContent({
  title,
  description,
  url,
  keyword = "",
}: {
  title: string;
  description: string;
  url: string;
  keyword?: string;
}) {
  const displayTitle = title || "";
  const displayDescription = description || "";

  const truncatedTitle = truncateGoogleMobileTitle(displayTitle);
  const truncatedDescription =
    truncateGoogleMobileDescription(displayDescription);

  const titleSegments = keyword
    ? highlightKeyword(truncatedTitle, keyword)
    : [{ text: truncatedTitle, isKeyword: false }];
  const descSegments = keyword
    ? highlightKeyword(truncatedDescription, keyword)
    : [{ text: truncatedDescription, isKeyword: false }];

  const { domain, breadcrumb } = formatGoogleBreadcrumb(url);

  return (
    <div
      aria-label="Google mobile search result preview"
      className="bg-white p-2 font-sans"
      style={{ fontFamily: "Arial, sans-serif", maxWidth: "360px" }}
    >
      {/* Favicon + URL row */}
      <div className="flex items-center gap-1.5 mb-0.5">
        <div
          className="w-3.5 h-3.5 rounded-full bg-[#E8EAED] flex-shrink-0"
          aria-hidden="true"
        />
        <div
          className="text-xs text-[#202124] leading-none"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          <span>{domain}</span>
          {breadcrumb && <span> › {breadcrumb}</span>}
        </div>
      </div>

      {/* Title */}
      <h3
        className="leading-tight mb-0.5"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          color: "#1A0DAB",
          fontWeight: 400,
          lineHeight: "20px",
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
            fontSize: "12px",
            color: "#4D5156",
            lineHeight: "18px",
          }}
        >
          <KeywordHighlighted segments={descSegments} />
        </p>
      )}
    </div>
  );
}

export function GoogleMobilePreview({
  title,
  description,
  url,
  keyword = "",
  showPhoneFrame = true,
}: GoogleMobilePreviewProps) {
  const titleTruncated = title.length > 50;
  const descTruncated = description.length > 120;

  const content = (
    <MobileSerpContent
      title={title}
      description={description}
      url={url}
      keyword={keyword}
    />
  );

  if (!showPhoneFrame) {
    return content;
  }

  return (
    <div className="max-w-[375px] mx-auto">
      {/* Phone chrome */}
      <div className="border-2 border-slate-800 dark:border-slate-600 rounded-[2rem] overflow-hidden">
        {/* Status bar */}
        <div className="bg-slate-800 dark:bg-slate-900 h-6 flex items-center px-4">
          <span className="text-white text-xs">9:41</span>
        </div>
        {/* Browser chrome */}
        <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 border-b border-slate-200 dark:border-slate-700">
          <div className="bg-white dark:bg-slate-700 rounded text-xs px-2 py-1 text-muted-foreground truncate">
            {url || "google.com"}
          </div>
        </div>
        {/* SERP Result */}
        <div className="bg-white">{content}</div>
      </div>

      {/* Mobile truncation warning */}
      {(titleTruncated || descTruncated) && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-md bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-3 text-sm"
        >
          <svg
            className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Content cut off on mobile
            </p>
            <ul className="mt-1 text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
              {titleTruncated && (
                <li>
                  Title is {title.length} chars — cut off at 50 on mobile.
                  Shorten it.
                </li>
              )}
              {descTruncated && (
                <li>
                  Description is {description.length} chars — cut off at 120 on
                  mobile. Trim it.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
