import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useHistory } from "./useHistory";

// ── localStorage mock ────────────────────────────────────────────────────────
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
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ── helpers ──────────────────────────────────────────────────────────────────
function makeEntry(
  overrides: Partial<Parameters<ReturnType<typeof useHistory>["save"]>[0]> = {},
) {
  return {
    title: "Test Page",
    description: "A test page description",
    url: "https://example.com",
    keyword: "test",
    overallScore: 80,
    ...overrides,
  };
}

// ── tests ────────────────────────────────────────────────────────────────────
describe("useHistory", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("initialises with empty history", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));
    expect(result.current.history).toHaveLength(0);
  });

  it("marks localStorage as available in browser environment", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));
  });

  it("saves an entry and reflects it in history state", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    act(() => {
      result.current.save(makeEntry({ title: "Saved Page" }));
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].title).toBe("Saved Page");
  });

  it("prepends new entries so the latest is first", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    act(() => {
      result.current.save(
        makeEntry({ title: "First", url: "https://first.com" }),
      );
      result.current.save(
        makeEntry({ title: "Second", url: "https://second.com" }),
      );
    });

    expect(result.current.history[0].title).toBe("Second");
  });

  it("removes an entry by id", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    act(() => {
      result.current.save(makeEntry());
    });

    const id = result.current.history[0].id;

    act(() => {
      result.current.remove(id);
    });

    expect(result.current.history).toHaveLength(0);
  });

  it("does not affect other entries when removing one", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    act(() => {
      result.current.save(
        makeEntry({ title: "Keep Me", url: "https://keep.com" }),
      );
      result.current.save(
        makeEntry({ title: "Remove Me", url: "https://remove.com" }),
      );
    });

    const removeId = result.current.history.find(
      (e) => e.title === "Remove Me",
    )!.id;

    act(() => {
      result.current.remove(removeId);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].title).toBe("Keep Me");
  });

  it("clears all history at once", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    act(() => {
      result.current.save(makeEntry({ url: "https://one.com" }));
      result.current.save(makeEntry({ url: "https://two.com" }));
      result.current.save(makeEntry({ url: "https://three.com" }));
    });

    expect(result.current.history.length).toBeGreaterThan(0);

    act(() => {
      result.current.clear();
    });

    expect(result.current.history).toHaveLength(0);
  });

  it("deduplicates entries with identical title+description+url", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    const entry = makeEntry({
      title: "Dup",
      description: "Same",
      url: "https://dup.com",
    });

    act(() => {
      result.current.save(entry);
      result.current.save(entry);
    });

    expect(result.current.history).toHaveLength(1);
  });

  it("persists entries to localStorage", async () => {
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    act(() => {
      result.current.save(makeEntry());
    });

    const raw = localStorageMock.getItem("seo-preview-history");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
  });
});
