"use client";

import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { EmbedCodeGenerator } from "./EmbedCodeGenerator";

/**
 * Toolbar button that opens the Embed Code Generator in a Dialog modal.
 * Satisfies F009 / DESIGN.md §7.13 (Flow 4).
 */
export function EmbedDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Get embed code"
          className="gap-1.5"
        >
          <Code2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Embed</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed on Your Site</DialogTitle>
        </DialogHeader>
        <EmbedCodeGenerator />
      </DialogContent>
    </Dialog>
  );
}
