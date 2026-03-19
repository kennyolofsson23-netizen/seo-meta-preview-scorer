/**
 * Embed code generation for the SEO Meta Preview widget
 */

import { APP } from "@/lib/constants";
import type { WidgetOptions } from "@/types";

/**
 * Generate iframe embed code for the widget
 */
export function generateEmbedCode(
  options: Partial<WidgetOptions> = {},
): string {
  const baseUrl = APP.url;
  const params = new URLSearchParams();

  if (options.showScores === false) params.set("showScores", "false");
  if (options.showPreviews === false) params.set("showPreviews", "false");
  if (options.compactMode === true) params.set("compact", "true");
  if (options.defaultTitle) params.set("title", options.defaultTitle);
  if (options.defaultDescription)
    params.set("description", options.defaultDescription);
  if (options.defaultUrl) params.set("url", options.defaultUrl);

  const queryString = params.toString();
  const embedUrl = `${baseUrl}/embed${queryString ? `?${queryString}` : ""}`;
  const height = options.compactMode ? "450" : "700";

  return `<iframe
  src="${embedUrl}"
  width="100%"
  height="${height}"
  frameborder="0"
  style="border: 1px solid #e5e5e5; border-radius: 8px; min-width: 320px; max-width: 100%;"
  title="SEO Meta Preview & Scorer"
  loading="lazy"
></iframe>`;
}

/**
 * Parse widget options from URL search params
 */
export function parseWidgetOptions(
  searchParams: URLSearchParams,
): Partial<WidgetOptions> {
  const options: Partial<WidgetOptions> = {};

  if (searchParams.get("showScores") === "false") options.showScores = false;
  if (searchParams.get("showPreviews") === "false")
    options.showPreviews = false;
  if (searchParams.get("compact") === "true") options.compactMode = true;

  const title = searchParams.get("title");
  if (title) options.defaultTitle = title;

  const description = searchParams.get("description");
  if (description) options.defaultDescription = description;

  const url = searchParams.get("url");
  if (url) options.defaultUrl = url;

  return options;
}
