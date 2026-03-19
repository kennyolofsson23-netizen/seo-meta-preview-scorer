"use client";

import { useRef, useState } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Monitor,
  Smartphone,
  Search,
  Share2,
  Download,
  Link2,
  Code2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { GoogleDesktopPreview } from "./GoogleDesktopPreview";
import { GoogleMobilePreview } from "./GoogleMobilePreview";
import { BingPreview } from "./BingPreview";
import { SocialCardPreview } from "./SocialCardPreview";
import { ScreenshotWatermark } from "@/components/export/ScreenshotWatermark";
import { EmbedCodeGenerator } from "@/components/embed/EmbedCodeGenerator";
import { captureAndDownload } from "@/lib/screenshot";
import { copyToClipboard } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface PreviewContainerProps {
  title: string;
  description: string;
  url: string;
  keyword?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  className?: string;
}

const TABS = [
  { value: "google-desktop", label: "Google", shortLabel: "G", icon: Monitor },
  {
    value: "google-mobile",
    label: "Mobile",
    shortLabel: "M",
    icon: Smartphone,
  },
  { value: "bing", label: "Bing", shortLabel: "B", icon: Search },
  { value: "social", label: "Social", shortLabel: "OG", icon: Share2 },
] as const;

export function PreviewContainer({
  title,
  description,
  url,
  keyword,
  ogImage,
  ogTitle,
  ogDescription,
  className,
}: PreviewContainerProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [embedOpen, setEmbedOpen] = useState(false);

  async function handleExport(format: "png" | "jpg") {
    if (!previewRef.current) return;
    setIsCapturing(true);
    try {
      await captureAndDownload(previewRef.current, { format });
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleShare() {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (description) params.set("description", description);
    if (url) params.set("url", url);
    if (keyword) params.set("keyword", keyword);
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const ok = await copyToClipboard(shareUrl);
    setShareStatus(ok ? "copied" : "error");
    setTimeout(() => setShareStatus("idle"), 2000);
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      <RadixTabs.Root defaultValue="google-desktop">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-border px-2 sm:px-4 pt-3 gap-2">
          <RadixTabs.List
            className="grid grid-cols-4 w-full sm:flex sm:w-auto sm:gap-1"
            aria-label="Search engine previews"
          >
            {TABS.map(({ value, label, shortLabel, icon: Icon }) => (
              <RadixTabs.Trigger
                key={value}
                value={value}
                className={cn(
                  "flex items-center justify-center gap-1 sm:gap-1.5 rounded-t px-1 sm:px-3 min-h-[44px] py-2 text-xs sm:text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                  "data-[state=active]:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </RadixTabs.Trigger>
            ))}
          </RadixTabs.List>

          {/* Toolbar: Share, Embed, Export */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              title="Copy shareable link"
              aria-label="Copy shareable link to clipboard"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors",
                "hover:text-foreground hover:bg-muted",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {shareStatus === "copied" ? (
                <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
              ) : shareStatus === "error" ? (
                <X className="h-4 w-4 text-red-600" aria-hidden="true" />
              ) : (
                <Link2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {/* Embed dialog button */}
            <Dialog.Root open={embedOpen} onOpenChange={setEmbedOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  title="Embed on your site"
                  aria-label="Open embed code dialog"
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded text-muted-foreground transition-colors",
                    "hover:text-foreground hover:bg-muted",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <Code2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg focus:outline-none">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold">
                      Embed on Your Site
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        aria-label="Close dialog"
                        className="flex h-11 w-11 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <EmbedCodeGenerator />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {/* Export dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  disabled={isCapturing}
                  aria-label={
                    isCapturing
                      ? "Saving preview image…"
                      : "Download preview image"
                  }
                  title="Download preview"
                  className={cn(
                    "flex h-11 items-center gap-1 rounded border border-border px-3 text-xs font-medium transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-muted",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {isCapturing ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {isCapturing ? "Saving…" : "Download"}
                  </span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={4}
                  className="z-50 min-w-[140px] rounded-md border border-border bg-card p-1 shadow-md"
                >
                  <DropdownMenu.Item
                    onSelect={() => handleExport("png")}
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm text-foreground outline-none hover:bg-muted focus:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download PNG
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => handleExport("jpg")}
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm text-foreground outline-none hover:bg-muted focus:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download JPG
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Preview panels */}
        <div ref={previewRef} className="relative p-4 sm:p-6">
          <RadixTabs.Content
            value="google-desktop"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <div
              aria-label="Google Desktop preview"
              className="rounded border border-border bg-white dark:bg-[#202124] p-4"
            >
              <GoogleDesktopPreview
                title={title}
                description={description}
                url={url}
                keyword={keyword}
              />
            </div>
          </RadixTabs.Content>

          <RadixTabs.Content
            value="google-mobile"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <div
              aria-label="Google Mobile preview"
              className="flex justify-center"
            >
              <GoogleMobilePreview
                title={title}
                description={description}
                url={url}
                keyword={keyword}
                showPhoneFrame={true}
              />
            </div>
          </RadixTabs.Content>

          <RadixTabs.Content
            value="bing"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <div
              aria-label="Bing preview"
              className="rounded border border-border bg-white dark:bg-[#1B1B1B] p-4"
            >
              <BingPreview
                title={title}
                description={description}
                url={url}
                keyword={keyword}
              />
            </div>
          </RadixTabs.Content>

          <RadixTabs.Content
            value="social"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <div
              aria-label="Social card preview"
              className="flex justify-center"
            >
              <SocialCardPreview
                title={title}
                description={description}
                url={url}
                ogImage={ogImage}
                ogTitle={ogTitle}
                ogDescription={ogDescription}
              />
            </div>
          </RadixTabs.Content>

          {/* Watermark — captured by html2canvas */}
          <ScreenshotWatermark />
        </div>
      </RadixTabs.Root>
    </div>
  );
}
