import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HistoryPanel } from "./HistoryPanel";
import * as historyLib from "@/lib/history";

// ── localStorage mock ─────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    _raw: () => store,
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ── helpers ───────────────────────────────────────────────────────────────────
function seedHistory(entries: Partial<historyLib.HistoryEntry>[] = []) {
  const full = entries.map((e, i) => ({
    id: `id-${i}`,
    title: `Page ${i}`,
    description: "A page description",
    url: `https://example.com/${i}`,
    keyword: "test",
    overallScore: 75,
    timestamp: Date.now() - i * 1000,
    ...e,
  }));
  localStorageMock.setItem("seo-preview-history", JSON.stringify(full));
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe("HistoryPanel", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("renders 'Saved Snapshots' heading", async () => {
    render(<HistoryPanel onSelect={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Saved Snapshots")).toBeInTheDocument(),
    );
  });

  it("shows empty-state message when history is empty", async () => {
    render(<HistoryPanel onSelect={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByText(/No snapshots yet/i)).toBeInTheDocument(),
    );
  });

  it("renders entries from history", async () => {
    seedHistory([
      { title: "SEO Article", overallScore: 90 },
      { title: "Product Page", overallScore: 60 },
    ]);
    render(<HistoryPanel onSelect={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("SEO Article")).toBeInTheDocument(),
    );
    expect(screen.getByText("Product Page")).toBeInTheDocument();
  });

  it("shows score for each entry", async () => {
    seedHistory([{ title: "My Page", overallScore: 85 }]);
    render(<HistoryPanel onSelect={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("85/100")).toBeInTheDocument());
  });

  it("shows entry count badge when history has items", async () => {
    seedHistory([{ title: "A" }, { title: "B" }, { title: "C" }]);
    render(<HistoryPanel onSelect={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
  });

  it("calls onSelect with the entry when an item is clicked", async () => {
    const onSelect = vi.fn();
    seedHistory([{ id: "abc", title: "Click Me", overallScore: 70 }]);
    render(<HistoryPanel onSelect={onSelect} />);

    await waitFor(() =>
      expect(screen.getByText("Click Me")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText("Load check: Click Me"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].id).toBe("abc");
  });

  it("shows '(no title)' for entries with empty title", async () => {
    seedHistory([{ title: "" }]);
    render(<HistoryPanel onSelect={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("(no title)")).toBeInTheDocument(),
    );
  });

  it("removes an entry when the delete button is clicked", async () => {
    seedHistory([{ id: "del-1", title: "Delete Me", overallScore: 50 }]);
    render(<HistoryPanel onSelect={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText("Delete Me")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText("Remove Delete Me from history"));

    await waitFor(() =>
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument(),
    );
  });

  it("clears all history when 'Clear all' is clicked", async () => {
    seedHistory([{ title: "Entry One" }, { title: "Entry Two" }]);
    render(<HistoryPanel onSelect={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText("Entry One")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText("Clear all saved snapshots"));

    await waitFor(() => {
      expect(screen.queryByText("Entry One")).not.toBeInTheDocument();
      expect(screen.queryByText("Entry Two")).not.toBeInTheDocument();
    });
  });

  it("renders as a list with accessible role", async () => {
    seedHistory([{ title: "Accessible Entry" }]);
    render(<HistoryPanel onSelect={vi.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByRole("list", { name: /saved seo checks/i }),
      ).toBeInTheDocument(),
    );
  });
});
