import { NextRequest, NextResponse } from "next/server";
import dns from "dns";
import https from "node:https";
import http from "node:http";
import type { IncomingMessage } from "node:http";
// Circular self-import: gives GET a reference to the same module namespace
// object that the test's `import * as routeModule from "./route"` resolves to,
// so vi.spyOn(routeModule, "_httpFetch") is visible when GET calls
// _routeModule._httpFetch(…). A dynamic `await import("./route")` at runtime
// can return a re-evaluated (different) namespace in Vite's SSR runner, which
// is why the spy was invisible in earlier iterations.
import * as _routeModule from "./route";
export const runtime = "nodejs";
const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 1_048_576; // 1 MB

function isPrivateIp(ip: string): boolean {
  const lower = ip.toLowerCase();

  // IPv6 loopback
  if (lower === "::1") return true;

  // IPv6 ULA (fc00::/7) — covers fc00:: through fdff::
  if (/^f[cd]/i.test(lower)) return true;

  // IPv6 link-local (fe80::/10) — covers fe80:: through febf::
  // The first 10 bits are 1111111010; 3rd hex nibble is 8, 9, a, or b
  if (/^fe[89ab]/i.test(lower)) return true;

  // IPv4-mapped IPv6 addresses (::ffff:x.x.x.x) — recursively check embedded IPv4
  const ipv4MappedMatch = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (ipv4MappedMatch) {
    return isPrivateIp(ipv4MappedMatch[1]);
  }

  // Check IPv4 ranges
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return false;

  const [a, b] = parts;

  // INADDR_ANY: 0.0.0.0 (binds to all interfaces — must be blocked)
  if (a === 0) return true;
  // Loopback: 127.0.0.0/8
  if (a === 127) return true;
  // RFC-1918: 10.0.0.0/8
  if (a === 10) return true;
  // RFC-1918: 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // RFC-1918: 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // Link-local: 169.254.0.0/16
  if (a === 169 && b === 254) return true;

  return false;
}

export interface HttpFetchResult {
  ok: boolean;
  status: number;
  contentType: string | null;
  contentLength: string | null;
  getBody(): Promise<string>;
}

/**
 * Makes an HTTP/HTTPS request to `parsedUrl`, but forces the TCP connection
 * to go to `resolvedAddress` (the already-verified IP) via a custom `lookup`
 * callback. This prevents DNS rebinding / TOCTOU attacks where an attacker
 * rotates a DNS record between the SSRF check and the actual connection.
 *
 * Exported as `export let` so Vite's SSR transform (used by vitest) creates
 * a getter+setter on the module namespace. Combined with the Object.defineProperty
 * call below that converts the descriptor to a plain writable value, vi.spyOn
 * installs a standard value spy that GET reaches via _routeModule._httpFetch(…).
 */
export let _httpFetch = function _httpFetchImpl(
  parsedUrl: URL,
  resolvedAddress: string,
  resolvedFamily: number,
  signal: AbortSignal,
): Promise<HttpFetchResult> {
  return new Promise<HttpFetchResult>((resolve, reject) => {
    const lib = parsedUrl.protocol === "https:" ? https : http;
    const port = parsedUrl.port
      ? parseInt(parsedUrl.port, 10)
      : parsedUrl.protocol === "https:"
        ? 443
        : 80;

    const req = lib.request(
      {
        hostname: parsedUrl.hostname,
        port,
        path: (parsedUrl.pathname || "/") + parsedUrl.search,
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SEO-Meta-Preview-Bot/1.0)",
          Accept: "text/html,application/xhtml+xml",
          Host: parsedUrl.host,
        },
        // Custom lookup: always connect to the pre-resolved, pre-checked IP.
        // This is the TOCTOU fix — no second DNS lookup happens.
        lookup: (
          _host: string,
          _opts: object,
          cb: (
            err: NodeJS.ErrnoException | null,
            address: string,
            family: number,
          ) => void,
        ) => {
          cb(null, resolvedAddress, resolvedFamily);
        },
      },
      (res: IncomingMessage) => {
        const chunks: Buffer[] = [];
        let totalBytes = 0;
        let bodyConsumed = false;

        const getBody = () =>
          new Promise<string>((resolveBody) => {
            if (bodyConsumed) {
              resolveBody(Buffer.concat(chunks).toString("utf-8"));
              return;
            }
            bodyConsumed = true;

            res.on("data", (chunk: Buffer) => {
              if (totalBytes + chunk.length > MAX_BODY_BYTES) {
                chunks.push(chunk.slice(0, MAX_BODY_BYTES - totalBytes));
                totalBytes = MAX_BODY_BYTES;
                req.destroy();
              } else {
                chunks.push(chunk);
                totalBytes += chunk.length;
              }
            });

            res.on("end", () =>
              resolveBody(Buffer.concat(chunks).toString("utf-8")),
            );
            res.on("error", () =>
              resolveBody(Buffer.concat(chunks).toString("utf-8")),
            );
          });

        resolve({
          ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
          status: res.statusCode ?? 0,
          contentType: (res.headers["content-type"] as string) ?? null,
          contentLength: (res.headers["content-length"] as string) ?? null,
          getBody,
        });
      },
    );

    signal.addEventListener("abort", () => {
      const err = new Error(
        "Request timed out. The URL took too long to respond.",
      );
      err.name = "AbortError";
      req.destroy(err);
    });

    req.on("error", (err: Error) => {
      reject(err);
    });

    req.end();
  });
};

// Vite's SSR transform (used by vitest) represents `export let` bindings as
// getter+setter descriptors on the module namespace object. tinyspy's spyOn
// detects the getter and installs a getter-spy, which works when GET reads
// _routeModule._httpFetch through the same namespace. However, converting the
// descriptor to a plain writable value property ensures tinyspy always installs
// a straightforward value spy, which is more robust across vitest versions.
try {
  const desc = Object.getOwnPropertyDescriptor(
    _routeModule as object,
    "_httpFetch",
  );
  if (desc && !desc.value && desc.get) {
    Object.defineProperty(_routeModule as object, "_httpFetch", {
      value: _httpFetch,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // In production (Next.js / webpack) circular imports behave differently;
  // ignore any error and let the direct export work normally.
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 },
    );
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only http/https URLs are supported" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  // SSRF protection: resolve hostname and block private/internal IP ranges
  let resolvedAddress: string;
  let resolvedFamily: number;
  try {
    const hostname = parsedUrl.hostname;
    if (hostname === "localhost") {
      return NextResponse.json(
        { error: "Requests to private/internal addresses are not allowed" },
        { status: 400 },
      );
    }
    const { address, family } = await dns.promises.lookup(hostname);
    if (isPrivateIp(address)) {
      return NextResponse.json(
        { error: "Requests to private/internal addresses are not allowed" },
        { status: 400 },
      );
    }
    resolvedAddress = address;
    resolvedFamily = family;
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch URL. Please enter the meta data manually." },
      { status: 502 },
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Call _httpFetch through the module namespace so vi.spyOn intercepts it
    // in tests. _routeModule is the circular self-import resolved at module
    // evaluation time — it is the exact same namespace object the test holds
    // via `import * as routeModule from "./route"`, guaranteeing the spy is
    // visible here.
    const response = await _routeModule._httpFetch(
      parsedUrl,
      resolvedAddress,
      resolvedFamily,
      controller.signal,
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: HTTP ${response.status}` },
        { status: 502 },
      );
    }

    const contentType = response.contentType ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL does not return an HTML page" },
        { status: 400 },
      );
    }

    // Body size limit: check Content-Length header first
    if (response.contentLength !== null) {
      const contentLength = parseInt(response.contentLength, 10);
      if (!isNaN(contentLength) && contentLength > MAX_BODY_BYTES) {
        return NextResponse.json(
          { error: "Response body too large" },
          { status: 400 },
        );
      }
    }

    const html = await response.getBody();

    // Parse meta tags using regex (no DOM parser available in Node.js without jsdom)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
      );
    const ogTitleMatch =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      );
    const ogDescMatch =
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      );
    const ogImageMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      );

    const decode = (str: string) =>
      str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

    return NextResponse.json({
      title: titleMatch ? decode(titleMatch[1]) : "",
      description: descMatch ? decode(descMatch[1]) : "",
      ogTitle: ogTitleMatch ? decode(ogTitleMatch[1]) : "",
      ogDescription: ogDescMatch ? decode(ogDescMatch[1]) : "",
      ogImage: ogImageMatch ? decode(ogImageMatch[1]) : "",
      url: parsedUrl.toString(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out. The URL took too long to respond." },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch URL. Please enter the meta data manually." },
      { status: 502 },
    );
  }
}
