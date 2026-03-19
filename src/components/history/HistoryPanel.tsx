"use client";

import { History, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useHistory } from "@/lib/hooks/useHistory";
import { formatHistoryDate, type HistoryEntry } from "@/lib/history";

interface HistoryPanelProps {
  onSelect: (entry: HistoryEntry) => void;
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const { history, isAvailable, remove, clear } = useHistory();

  if (!isAvailable) return null;
  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Saved Snapshots</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          No snapshots yet. Go to{" "}
          <strong className="font-medium text-foreground">
            Preview &amp; Score
          </strong>
          , fill in your meta tags, then hit{" "}
          <strong className="font-medium text-foreground">
            Save Snapshot to History
          </strong>{" "}
          to compare title and description variations side by side.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Saved Snapshots</h3>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {history.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          className="text-xs text-muted-foreground h-6 px-2"
          aria-label="Clear all saved snapshots"
        >
          Clear all
        </Button>
      </div>

      <ul className="space-y-1" role="list" aria-label="Saved SEO checks">
        {history.map((entry) => (
          <li key={entry.id}>
            <div className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors group">
              <button
                onClick={() => onSelect(entry)}
                className="flex-1 text-left min-w-0"
                aria-label={`Load check: ${entry.title}`}
              >
                <p className="text-xs font-medium text-foreground truncate">
                  {entry.title || "(no title)"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-medium ${
                      entry.overallScore >= 80
                        ? "text-green-600 dark:text-green-400"
                        : entry.overallScore >= 50
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {entry.overallScore}/100
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatHistoryDate(entry.timestamp)}
                  </span>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(entry.id)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                aria-label={`Remove ${entry.title} from history`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <RotateCcw
                className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => onSelect(entry)}
                aria-hidden="true"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
