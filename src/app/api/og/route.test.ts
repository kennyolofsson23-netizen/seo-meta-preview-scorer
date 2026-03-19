// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ────────────────────────────────────────────────────────────────────────────
// Mocks
// ────────────────────────────────────────────────────────────────────────────

vi.mock("next/og", () => ({
  ImageResponse: vi.fn().mockImplementation((element, options) => {
    return { element, options };
  }),
}));

// Import after mocking so the route picks up the mocked ImageResponse
import { GET } from "./route";
import { ImageResponse } from "next/og";

const MockedImageResponse = vi.mocked(ImageResponse);

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function makeRequest(url: string): NextRequest {
  return new Request(url) as NextRequest;
}

/**
 * Recursively walks a React element tree and collects all `style.color` values
 * found on any node. This lets us assert that a specific color hex appears
 * somewhere in the rendered JSX without coupling to the exact tree shape.
 */
function collectColors(element: unknown): string[] {
  if (!element || typeof element !== "object") return [];

  const el = element as Record<string, unknown>;
  const colors: string[] = [];

  // Pick up color from this node's style prop
  const props = el["props"] as Record<string, unknown> | undefined;
  if (props) {
    const style = props["style"] as Record<string, unknown> | undefined;
    if (style && typeof style["color"] === "string") {
      colors.push(style["color"] as string);
    }

    // Recurse into children
    const children = props["children"];
    if (Array.isArray(children)) {
      for (const child of children) {
        colors.push(...collectColors(child));
      }
    } else {
      colors.push(...collectColors(children));
    }
  }

  return colors;
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe("GET /api/og", () => {
  beforeEach(() => {
    MockedImageResponse.mockClear();
  });

  // ── ImageResponse dimensions ───────────────────────────────────────────────

  it("calls ImageResponse with 1200×630 dimensions", async () => {
    const req = makeRequest("http://localhost/api/og");
    await GET(req);

    expect(MockedImageResponse).toHaveBeenCalledOnce();
    const [, options] = MockedImageResponse.mock.calls[0];
    expect(options).toEqual({ width: 1200, height: 630 });
  });

  // ── Default params ─────────────────────────────────────────────────────────

  it("uses default title when no title param is supplied", async () => {
    const req = makeRequest("http://localhost/api/og");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const allText = JSON.stringify(element);
    expect(allText).toContain("SEO Meta Preview & Scorer");
  });

  it("uses default description when no params are supplied", async () => {
    const req = makeRequest("http://localhost/api/og");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const allText = JSON.stringify(element);
    expect(allText).toContain(
      "Pixel-perfect SEO preview and real-time scoring",
    );
  });

  // ── Custom title ───────────────────────────────────────────────────────────

  it("renders the custom title param in the element tree", async () => {
    const req = makeRequest("http://localhost/api/og?title=My+Custom+Title");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const allText = JSON.stringify(element);
    expect(allText).toContain("My Custom Title");
  });

  // ── Custom description (only shown when score is absent) ───────────────────

  it("renders a custom description when no score is provided", async () => {
    const req = makeRequest(
      "http://localhost/api/og?description=My+custom+description",
    );
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const allText = JSON.stringify(element);
    expect(allText).toContain("My custom description");
  });

  // ── Score color logic ──────────────────────────────────────────────────────

  it("score=85 → uses green (#22c55e)", async () => {
    const req = makeRequest("http://localhost/api/og?score=85");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const colors = collectColors(element);
    expect(colors).toContain("#22c55e");
  });

  it("score=65 → uses yellow (#eab308)", async () => {
    const req = makeRequest("http://localhost/api/og?score=65");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const colors = collectColors(element);
    expect(colors).toContain("#eab308");
  });

  it("score=30 → uses red (#ef4444)", async () => {
    const req = makeRequest("http://localhost/api/og?score=30");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const colors = collectColors(element);
    expect(colors).toContain("#ef4444");
  });

  it("non-numeric score ('abc') → NaN → falls through to red (#ef4444)", async () => {
    const req = makeRequest("http://localhost/api/og?score=abc");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const colors = collectColors(element);
    expect(colors).toContain("#ef4444");
  });

  // ── Boundary conditions ────────────────────────────────────────────────────

  it("score=80 (boundary) → green (#22c55e)", async () => {
    const req = makeRequest("http://localhost/api/og?score=80");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const colors = collectColors(element);
    expect(colors).toContain("#22c55e");
  });

  it("score=50 (boundary) → yellow (#eab308)", async () => {
    const req = makeRequest("http://localhost/api/og?score=50");
    await GET(req);

    const [element] = MockedImageResponse.mock.calls[0];
    const colors = collectColors(element);
    expect(colors).toContain("#eab308");
  });
});
