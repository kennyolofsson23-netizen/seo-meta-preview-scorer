"use client";

/**
 * Visually hidden element — present in DOM for legacy reasons but watermark
 * is drawn directly on the canvas by screenshot.ts addWatermark().
 * Hidden from view to avoid overlaying the live preview.
 */
export function ScreenshotWatermark() {
  return <span aria-hidden="true" className="sr-only" />;
}
