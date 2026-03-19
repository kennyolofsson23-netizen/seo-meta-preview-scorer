// @vitest-environment node
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dns so SSRF hostname resolution doesn't make real network calls in tests.
// Default: resolves to a non-private IP (93.184.216.34 = example.com).
// Individual SSRF tests override this with mockResolvedValueOnce.
vi.mock("dns", () => ({
  default: {
    promises: {
      lookup: vi
        .fn()
        .mockResolvedValue({ address: "93.184.216.34", family: 4 }),
    },
  },
}));

import * as routeModule from "./route";
import dns from "dns";

const { GET } = routeModule;

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

function makeHtml(opts: {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}): string {
  const metaTags = [
    opts.description
      ? `<meta name="description" content="${opts.description}"/>`
      : "",
    opts.ogTitle ? `<meta property="og:title" content="${opts.ogTitle}"/>` : "",
    opts.ogDescription
      ? `<meta property="og:description" content="${opts.ogDescription}"/>`
      : "",
    opts.ogImage ? `<meta property="og:image" content="${opts.ogImage}"/>` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `<html><head><title>${opts.title ?? ""}</title>${metaTags}</head><body></body></html>`;
}

/** Stub the internal _httpFetch helper with a successful HTML response */
function stubFetchSuccess(
  html: string,
  contentType = "text/html; charset=utf-8",
) {
  vi.spyOn(routeModule._httpFetch, "fn").mockResolvedValue({
    ok: true,
    status: 200,
    contentType,
    contentLength: null,
    getBody: async () => html,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe("GET /api/fetch-meta", () => {
  beforeEach(() => {
    // Re-establish the default DNS mock before each test because
    // vi.restoreAllMocks() in afterEach resets the vi.fn() implementation
    // that was set in the vi.mock factory, causing subsequent tests to see
    // dns.promises.lookup return undefined and throw.
    vi.mocked(dns.promises.lookup).mockResolvedValue({
      address: "93.184.216.34",
      family: 4,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── SSRF / private IP blocking ────────────────────────────────────────────

  describe("SSRF protection - private IP blocking", () => {
    const mockedLookup = vi.mocked(dns.promises.lookup);

    it("blocks loopback 127.0.0.1 (RFC loopback)", async () => {
      mockedLookup.mockResolvedValueOnce({ address: "127.0.0.1", family: 4 });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://internal.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks 10.0.0.1 (RFC-1918 10.0.0.0/8)", async () => {
      mockedLookup.mockResolvedValueOnce({ address: "10.0.0.1", family: 4 });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://corp.internal.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks 192.168.1.1 (RFC-1918 192.168.0.0/16)", async () => {
      mockedLookup.mockResolvedValueOnce({
        address: "192.168.1.1",
        family: 4,
      });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://router.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks 172.16.0.1 (RFC-1918 172.16.0.0/12)", async () => {
      mockedLookup.mockResolvedValueOnce({ address: "172.16.0.1", family: 4 });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://docker.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks 172.31.255.255 (top of RFC-1918 172.16.0.0/12 range)", async () => {
      mockedLookup.mockResolvedValueOnce({
        address: "172.31.255.255",
        family: 4,
      });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://host.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
    });

    it("blocks ::1 (IPv6 loopback)", async () => {
      mockedLookup.mockResolvedValueOnce({ address: "::1", family: 6 });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://ipv6host.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks the literal hostname 'localhost'", async () => {
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=http://localhost/secret",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks 0.0.0.0 (INADDR_ANY)", async () => {
      mockedLookup.mockResolvedValueOnce({ address: "0.0.0.0", family: 4 });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://inaddr-any.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks fc00::1 (IPv6 ULA fc00::/7)", async () => {
      mockedLookup.mockResolvedValueOnce({ address: "fc00::1", family: 6 });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://ula.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks fd12:3456::1 (IPv6 ULA fd00::/8)", async () => {
      mockedLookup.mockResolvedValueOnce({
        address: "fd12:3456::1",
        family: 6,
      });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://ula2.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks fe80::1 (IPv6 link-local fe80::/10)", async () => {
      mockedLookup.mockResolvedValueOnce({ address: "fe80::1", family: 6 });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://linklocal.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks ::ffff:127.0.0.1 (IPv4-mapped loopback)", async () => {
      mockedLookup.mockResolvedValueOnce({
        address: "::ffff:127.0.0.1",
        family: 6,
      });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://mapped-loopback.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });

    it("blocks ::ffff:192.168.1.1 (IPv4-mapped private)", async () => {
      mockedLookup.mockResolvedValueOnce({
        address: "::ffff:192.168.1.1",
        family: 6,
      });
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://mapped-private.example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/private|internal/i);
    });
  });

  // ── Body size limit ────────────────────────────────────────────────────────

  describe("body size limits", () => {
    it("returns 400 when Content-Length header exceeds 1 MB", async () => {
      vi.spyOn(routeModule._httpFetch, "fn").mockResolvedValue({
        ok: true,
        status: 200,
        contentType: "text/html; charset=utf-8",
        contentLength: String(1_048_577), // 1 MB + 1 byte
        getBody: async () => "<html></html>",
      });

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/too large/i);
    });
  });

  // ── Missing / invalid parameters ──────────────────────────────────────────

  describe("parameter validation", () => {
    it("returns 400 when the url query parameter is missing", async () => {
      const req = makeRequest("http://localhost:3000/api/fetch-meta");
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/url parameter/i);
    });

    it("returns 400 for an invalid URL format", async () => {
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=not-a-url",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid url/i);
    });

    it("returns 400 for a non-http/https protocol (e.g. ftp://)", async () => {
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=ftp://example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/http/i);
    });

    it("returns 400 for a file:// URL", async () => {
      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=file:///etc/passwd",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
    });
  });

  // ── Successful fetch + parsing ─────────────────────────────────────────────

  describe("successful meta tag extraction", () => {
    it("returns 200 with the page title parsed from <title>", async () => {
      stubFetchSuccess(makeHtml({ title: "My Awesome Page" }));

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.title).toBe("My Awesome Page");
    });

    it("returns the meta description", async () => {
      stubFetchSuccess(
        makeHtml({
          title: "Page",
          description: "A great description for SEO.",
        }),
      );

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const body = await (await GET(req)).json();
      expect(body.description).toBe("A great description for SEO.");
    });

    it("returns og:title when present", async () => {
      stubFetchSuccess(
        makeHtml({ title: "Page Title", ogTitle: "OG Specific Title" }),
      );

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const body = await (await GET(req)).json();
      expect(body.ogTitle).toBe("OG Specific Title");
    });

    it("returns og:description when present", async () => {
      stubFetchSuccess(
        makeHtml({
          title: "Page",
          ogDescription: "OG description text here",
        }),
      );

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const body = await (await GET(req)).json();
      expect(body.ogDescription).toBe("OG description text here");
    });

    it("returns og:image URL when present", async () => {
      stubFetchSuccess(
        makeHtml({
          title: "Page",
          ogImage: "https://example.com/image.jpg",
        }),
      );

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const body = await (await GET(req)).json();
      expect(body.ogImage).toBe("https://example.com/image.jpg");
    });

    it("returns the canonical URL in the response body", async () => {
      stubFetchSuccess(makeHtml({ title: "Page" }));

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com/page",
      );
      const body = await (await GET(req)).json();
      expect(body.url).toBe("https://example.com/page");
    });

    it("returns empty strings for meta tags that are absent", async () => {
      stubFetchSuccess("<html><head><title>Minimal</title></head></html>");

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const body = await (await GET(req)).json();
      expect(body.description).toBe("");
      expect(body.ogTitle).toBe("");
      expect(body.ogDescription).toBe("");
      expect(body.ogImage).toBe("");
    });

    it("HTML-decodes entities in the title (&amp; → &)", async () => {
      stubFetchSuccess(makeHtml({ title: "My Site &amp; More" }));

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const body = await (await GET(req)).json();
      expect(body.title).toBe("My Site & More");
    });

    it("HTML-decodes &quot; entities in descriptions", async () => {
      stubFetchSuccess(
        makeHtml({ description: "It&apos;s &quot;awesome&quot;" }),
      );

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const body = await (await GET(req)).json();
      // &apos; is &#39; in HTML5 — route decodes &#39; → '
      expect(body.description).toContain("awesome");
    });
  });

  // ── Upstream errors ────────────────────────────────────────────────────────

  describe("upstream fetch failures", () => {
    it("returns 400 when the fetched URL returns non-HTML content type", async () => {
      vi.spyOn(routeModule._httpFetch, "fn").mockResolvedValue({
        ok: true,
        status: 200,
        contentType: "application/json",
        contentLength: null,
        getBody: async () => "{}",
      });

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com/api",
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/html/i);
    });

    it("returns 502 when the upstream server returns a non-OK status", async () => {
      vi.spyOn(routeModule._httpFetch, "fn").mockResolvedValue({
        ok: false,
        status: 404,
        contentType: "text/html",
        contentLength: null,
        getBody: async () => "<html>Not Found</html>",
      });

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com/missing",
      );
      const res = await GET(req);
      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toMatch(/404/);
    });

    it("returns 502 when fetch throws a network error", async () => {
      vi.spyOn(routeModule._httpFetch, "fn").mockRejectedValue(
        new Error("Network error"),
      );

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(502);
    });

    it("returns 504 when fetch times out (AbortError)", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";

      vi.spyOn(routeModule._httpFetch, "fn").mockRejectedValue(abortError);

      const req = makeRequest(
        "http://localhost:3000/api/fetch-meta?url=https://example.com",
      );
      const res = await GET(req);
      expect(res.status).toBe(504);
      const body = await res.json();
      expect(body.error).toMatch(/timed? ?out/i);
    });
  });
});
