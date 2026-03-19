"use client";

import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { generateEmbedCode } from "@/lib/embed";
import { copyToClipboard } from "@/lib/utils";
import type { WidgetOptions } from "@/types";

export function EmbedCodeGenerator() {
  const [options, setOptions] = useState<Partial<WidgetOptions>>({
    showScores: true,
    showPreviews: true,
    compactMode: false,
  });
  const [copied, setCopied] = useState(false);

  const embedCode = generateEmbedCode(options);

  async function handleCopy() {
    const ok = await copyToClipboard(embedCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Code2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Get Embed Code</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Add this free SEO checker to any website with one snippet of HTML. Your
        visitors get Google, Bing, and social previews with live scoring — no
        setup, no accounts, nothing to install.
      </p>

      {/* Options */}
      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="text-sm font-medium">Customize widget</h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Show scores toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted">
            <input
              type="checkbox"
              checked={options.showScores !== false}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  showScores: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <div>
              <p className="text-sm font-medium">SEO Scores</p>
              <p className="text-xs text-muted-foreground">
                Include the score breakdown below the form
              </p>
            </div>
          </label>

          {/* Show previews toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted">
            <input
              type="checkbox"
              checked={options.showPreviews !== false}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  showPreviews: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <div>
              <p className="text-sm font-medium">SERP Previews</p>
              <p className="text-xs text-muted-foreground">
                Include Google, Bing, and social card previews
              </p>
            </div>
          </label>

          {/* Compact mode toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted">
            <input
              type="checkbox"
              checked={options.compactMode === true}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  compactMode: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <div>
              <p className="text-sm font-medium">Compact Mode</p>
              <p className="text-xs text-muted-foreground">
                Shorter embed height (450px instead of 700px)
              </p>
            </div>
          </label>
        </div>

        {/* Default values */}
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pre-fill values (optional)
          </p>
          <div className="space-y-2">
            <Input
              placeholder="Pre-fill a default page title…"
              value={options.defaultTitle ?? ""}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  defaultTitle: e.target.value || undefined,
                }))
              }
            />
            <Input
              placeholder="Pre-fill a default meta description…"
              value={options.defaultDescription ?? ""}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  defaultDescription: e.target.value || undefined,
                }))
              }
            />
            <Input
              placeholder="https://yoursite.com"
              type="url"
              value={options.defaultUrl ?? ""}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  defaultUrl: e.target.value || undefined,
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Generated code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Your embed code</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
            aria-label={copied ? "Copied!" : "Copy embed code"}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed text-foreground font-mono whitespace-pre-wrap break-all">
          {embedCode}
        </pre>
      </div>

      {/* Preview link */}
      <p className="text-xs text-muted-foreground">
        See how the widget looks before you embed it —{" "}
        <a
          href="/embed"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          open preview
        </a>
      </p>
    </div>
  );
}
