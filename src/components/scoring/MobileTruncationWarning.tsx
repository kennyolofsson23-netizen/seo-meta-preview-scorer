"use client";

import * as React from "react";

export interface MobileTruncationWarningProps {
  titleTruncated: boolean;
  descriptionTruncated: boolean;
  titleLength: number;
  descriptionLength: number;
}

export function MobileTruncationWarning({
  titleTruncated,
  descriptionTruncated,
  titleLength,
  descriptionLength,
}: MobileTruncationWarningProps) {
  if (!titleTruncated && !descriptionTruncated) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-950"
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
          Mobile Truncation Warning
        </p>
        <ul className="mt-1 space-y-1">
          {titleTruncated && (
            <li className="text-sm text-yellow-700 dark:text-yellow-400">
              Title is {titleLength} chars — will be truncated on mobile (limit:
              50 chars)
            </li>
          )}
          {descriptionTruncated && (
            <li className="text-sm text-yellow-700 dark:text-yellow-400">
              Description is {descriptionLength} chars — will be truncated on
              mobile (limit: 120 chars)
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
