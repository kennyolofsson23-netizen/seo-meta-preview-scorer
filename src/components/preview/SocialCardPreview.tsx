"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { extractDomain } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type Platform = "twitter" | "linkedin" | "facebook";

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "twitter", label: "Twitter/X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
];

const PLATFORM_CONFIG: Record<Platform, { maxTitle: number; maxDesc: number }> =
  {
    twitter: { maxTitle: 70, maxDesc: 200 },
    linkedin: { maxTitle: 119, maxDesc: 300 },
    facebook: { maxTitle: 65, maxDesc: 155 },
  };

function truncatePlatform(text: string, max: number): string {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export interface SocialCardPreviewProps {
  title: string;
  description: string;
  url: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

function ImagePlaceholder() {
  return (
    <div className="aspect-[1.91/1] bg-muted border-b border-border flex flex-col items-center justify-center gap-2">
      <ImageIcon className="h-8 w-8 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">
        Paste an og:image URL to preview your social card image
      </p>
      <p className="text-[10px] text-muted-foreground/60">
        Ideal size: 1200 × 630px
      </p>
    </div>
  );
}

export function SocialCardPreview({
  title,
  description,
  url,
  ogTitle,
  ogDescription,
  ogImage,
}: SocialCardPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [platform, setPlatform] = useState<Platform>("twitter");

  const config = PLATFORM_CONFIG[platform];
  const domain = extractDomain(url);
  const rawTitle = ogTitle || title;
  const rawDescription = ogDescription || description;
  const displayTitle = truncatePlatform(rawTitle, config.maxTitle);
  const displayDescription = truncatePlatform(rawDescription, config.maxDesc);

  const showPlaceholder = !ogImage || imageError;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[500px]">
      {/* Platform toggle */}
      <div
        role="group"
        aria-label="Social platform"
        className="flex rounded-md border border-border overflow-hidden self-stretch"
      >
        {PLATFORMS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPlatform(id)}
            aria-pressed={platform === id}
            className={cn(
              "flex-1 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              platform === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Social card */}
      <div
        role="region"
        aria-label={`${PLATFORMS.find((p) => p.id === platform)?.label} social card preview`}
        className="border border-border rounded-lg overflow-hidden w-full"
      >
        {/* Image area */}
        {showPlaceholder ? (
          <ImagePlaceholder />
        ) : (
          <div className="aspect-[1.91/1] bg-muted border-b border-border relative">
            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Paste an og:image URL to preview your social card image
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  Ideal size: 1200 × 630px
                </p>
              </div>
            )}
            <img
              src={ogImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Text area */}
        <div className="p-3 bg-card">
          <p className="text-xs uppercase text-muted-foreground tracking-wide">
            {domain}
          </p>
          <p className="font-semibold text-sm text-card-foreground line-clamp-2">
            {displayTitle}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
            {displayDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
