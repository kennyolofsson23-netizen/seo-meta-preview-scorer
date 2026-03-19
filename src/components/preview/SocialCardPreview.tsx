import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { extractDomain } from "@/lib/scoring";

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

  const domain = extractDomain(url);
  const displayTitle = ogTitle || title;
  const displayDescription = ogDescription || description;

  const showPlaceholder = !ogImage || imageError;

  return (
    <div
      role="region"
      aria-label="Social card preview"
      className="border border-border rounded-lg overflow-hidden max-w-[500px]"
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
  );
}
