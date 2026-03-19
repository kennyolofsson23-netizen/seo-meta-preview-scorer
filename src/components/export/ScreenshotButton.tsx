"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { captureAndDownload } from "@/lib/screenshot";

interface ScreenshotButtonProps {
  /** Ref to the element to screenshot */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Format to download */
  format?: "png" | "jpg";
  /** Optional callback after download */
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ScreenshotButton({
  targetRef,
  format = "png",
  onSuccess,
  onError,
}: ScreenshotButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  async function handleClick() {
    if (!targetRef.current) {
      onError?.(
        "Nothing to capture — switch to a preview tab and try again.",
      );
      return;
    }

    setIsCapturing(true);
    try {
      const result = await captureAndDownload(targetRef.current, { format });
      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(
          result.error ??
            "Export failed — try again, or switch browsers if the issue persists.",
        );
      }
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isCapturing}
      aria-busy={isCapturing}
      aria-label={
        isCapturing
          ? "Saving preview image…"
          : `Save preview as ${format.toUpperCase()}`
      }
      className="gap-1.5"
    >
      {isCapturing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Saving…</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">
            Save as {format.toUpperCase()}
          </span>
        </>
      )}
    </Button>
  );
}
