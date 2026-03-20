import { NextRequest, NextResponse } from "next/server";
import dns from "dns";

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
 * Fetches a URL using the global fetch() API. SSRF protection is handled
 * separately via DNS resolution before this is called.
 *
 * Exported as a plain object so tests can stub it:
 *   vi.spyOn(routeModule._httpFetch, "fn").mockResolvedValue(...)
 */
export const _httpFetch = {
  fn: async function _httpFetchImpl(
    parsedUrl: URL,
    signal: AbortSignal,
  ): Promise<HttpFetchResult> {
    const response = await fetch(parsedUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEO-Meta-Preview-Bot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal,
      redirect: "follow",
    });

    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
      getBody: async () => {
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const truncated =
          bytes.length > MAX_BODY_BYTES
            ? bytes.slice(0, MAX_BODY_BYTES)
            : bytes;
        return new TextDecoder("utf-8").decode(truncated);
      },
    };
  },
};

/**
 * Resolve DNS for SSRF protection. Uses dns.resolve4/resolve6 which query
 * DNS servers directly (works on Vercel serverless, unlike dns.lookup which
 * uses the OS resolver and can fail).
 */
export const _dnsResolve = {
  fn: async function _dnsResolveImpl(
    hostname: string,
  ): Promise<{ address: string; family: number }> {
    try {
      const addresses = await dns.promises.resolve4(hostname);
      if (addresses.length > 0) {
        return { address: addresses[0], family: 4 };
      }
    } catch {
      // IPv4 failed, try IPv6
    }
    try {
      const addresses = await dns.promises.resolve6(hostname);
      if (addresses.length > 0) {
        return { address: addresses[0], family: 6 };
      }
    } catch {
      // IPv6 also failed
    }
    throw new Error("DNS resolution failed");
  },
};

/**
 * Extract an attribute value from a short, already-bounded tag string.
 */
function getTagAttr(tag: string, attr: string): string | null {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const dq = new RegExp(`\\b${escaped}\\s*=\\s*"([^"]*)"`, "i").exec(tag);
  if (dq) return dq[1];
  const sq = new RegExp(`\\b${escaped}\\s*=\\s*'([^']*)'`, "i").exec(tag);
  if (sq) return sq[1];
  return null;
}

/**
 * Find the content attribute of a meta tag matching attrName=attrValue.
 * Uses bounded regex to prevent ReDoS.
 */
function findMetaContent(
  html: string,
  attrName: "name" | "property",
  attrValue: string,
): string | null {
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

  // SSRF protection: resolve hostname and block private/internal IPs
  try {
    const hostname = parsedUrl.hostname;
    if (hostname === "localhost") {
      return NextResponse.json(
        { error: "Requests to private/internal addresses are not allowed" },
        { status: 400 },
      );
    }
    const { address } = await _dnsResolve.fn(hostname);
    if (isPrivateIp(address)) {
      return NextResponse.json(
        { error: "Requests to private/internal addresses are not allowed" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to resolve hostname. Please check the URL." },
      { status: 502 },
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await _httpFetch.fn(parsedUrl, controller.signal);
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
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch URL: ${msg}` },
      { status: 502 },
    );
  }
}
