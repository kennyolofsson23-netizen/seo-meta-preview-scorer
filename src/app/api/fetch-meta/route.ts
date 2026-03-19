import { NextRequest, NextResponse } from "next/server";
import dns from "dns";
import https from "node:https";
import http from "node:http";
import type { IncomingMessage } from "node:http";

export const runtime = "nodejs";
const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 1_048_576; // 1 MB

function isPrivateIp(ip: string): boolean {
  // IPv6 loopback
  if (ip === "::1") return true;

  // IPv4-mapped IPv6: ::ffff:x.x.x.x — extract the IPv4 part and re-check
  const lowerIp = ip.toLowerCase();
  if (lowerIp.startsWith("::ffff:")) {
    return isPrivateIp(lowerIp.slice(7));
  }

  // IPv6 addresses (contain colons but not IPv4-mapped)
  if (ip.includes(":")) {
    const firstGroup = lowerIp.split(":")[0];
    if (firstGroup) {
      const val = parseInt(firstGroup, 16);
      if (!isNaN(val)) {
        // ULA: fc00::/7 (covers fc00:: – fdff::)
        if ((val & 0xfe00) === 0xfc00) return true;
        // Link-local: fe80::/10 (covers fe80:: – febf::)
        if ((val & 0xffc0) === 0xfe80) return true;
      }
    }
    return false;
  }

  // Check IPv4 ranges
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return false;

  const [a, b] = parts;

  // INADDR_ANY: 0.0.0.0
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
 * Exported as a plain object (`{ fn }`) so tests can stub it without any
 * circular-import tricks:
 *
 *   vi.spyOn(routeModule._httpFetch, "fn").mockResolvedValue(...)
 *
 * Because `_httpFetch` is the *same* object reference both inside the module
 * and on the module namespace, replacing `.fn` is visible to GET() immediately.
 */
export const _httpFetch = {
  fn: function _httpFetchImpl(
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
  },
};

/**
 * Extract an attribute value from a short, already-bounded tag string.
 * Each branch is a simple anchored pattern with no nested quantifiers,
 * so there is no risk of catastrophic backtracking.
 */
function getTagAttr(tag: string, attr: string): string | null {
  // Escape any regex special chars in the attribute name (e.g. "og:title" is safe,
  // but we escape defensively in case callers pass unexpected values in the future).
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const dq = new RegExp(`\\b${escaped}\\s*=\\s*"([^"]*)"`, "i").exec(tag);
  if (dq) return dq[1];
  const sq = new RegExp(`\\b${escaped}\\s*=\\s*'([^']*)'`, "i").exec(tag);
  if (sq) return sq[1];
  return null;
}

/**
 * Find the `content` attribute of the first <meta> tag where
 * `attrName` equals `attrValue` (case-insensitive).
 *
 * The outer pattern uses [^>]{0,1024} — a bounded, non-backtracking
 * character class — so catastrophic backtracking is impossible regardless
 * of how malformed the HTML is.
 */
function findMetaContent(
  html: string,
  attrName: "name" | "property",
  attrValue: string,
): string | null {
  // Extract individual <meta …> tags with a hard length cap.
  // Tags longer than ~1024 chars are not matched (they are skipped, not hung on).
  const metaTagRe = /<meta\b[^>]{0,1024}>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaTagRe.exec(html)) !== null) {
    const tag = m[0];
    const val = getTagAttr(tag, attrName);
    if (val && val.toLowerCase() === attrValue.toLowerCase()) {
      return getTagAttr(tag, "content");
    }
  }
  return null;
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

    const response = await _httpFetch.fn(
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

    // Parse meta tags using a safe two-step approach:
    //   1. Extract individual bounded-length <meta> tags (prevents ReDoS).
    //   2. Parse attributes from each short tag individually.
    const titleMatch = html.match(/<title[^>]*>([^<]{0,512})<\/title>/i);
    const metaDescription = findMetaContent(html, "name", "description");
    const metaOgTitle = findMetaContent(html, "property", "og:title");
    const metaOgDescription = findMetaContent(
      html,
      "property",
      "og:description",
    );
    const metaOgImage = findMetaContent(html, "property", "og:image");

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
      description: metaDescription ? decode(metaDescription) : "",
      ogTitle: metaOgTitle ? decode(metaOgTitle) : "",
      ogDescription: metaOgDescription ? decode(metaOgDescription) : "",
      ogImage: metaOgImage ? decode(metaOgImage) : "",
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
