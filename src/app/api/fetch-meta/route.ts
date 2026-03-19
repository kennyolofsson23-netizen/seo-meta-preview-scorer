import { NextRequest, NextResponse } from "next/server";
import dns from "dns";

export const runtime = "nodejs";
const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 1_048_576; // 1 MB

function isPrivateIp(ip: string): boolean {
  // IPv6 loopback
  if (ip === "::1") return true;

  // Check IPv4 ranges
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return false;

  const [a, b] = parts;

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
  try {
    const hostname = parsedUrl.hostname;
    if (hostname === "localhost") {
      return NextResponse.json(
        { error: "Requests to private/internal addresses are not allowed" },
        { status: 400 },
      );
    }
    const { address } = await dns.promises.lookup(hostname);
    if (isPrivateIp(address)) {
      return NextResponse.json(
        { error: "Requests to private/internal addresses are not allowed" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch URL. Please enter the meta data manually." },
      { status: 502 },
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      redirect: "error",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEO-Meta-Preview-Bot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: HTTP ${response.status}` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL does not return an HTML page" },
        { status: 400 },
      );
    }

    // Body size limit: check Content-Length header first
    const contentLengthHeader = response.headers.get("content-length");
    if (contentLengthHeader !== null) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (!isNaN(contentLength) && contentLength > MAX_BODY_BYTES) {
        return NextResponse.json(
          { error: "Response body too large" },
          { status: 400 },
        );
      }
    }

    // Read body with a 1MB cap via ReadableStream when available,
    // falling back to response.text() for environments without response.body (e.g. test mocks)
    let html: string;
    if (response.body) {
      const reader = (response.body as ReadableStream<Uint8Array>).getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          if (totalBytes + value.byteLength > MAX_BODY_BYTES) {
            chunks.push(value.slice(0, MAX_BODY_BYTES - totalBytes));
            totalBytes = MAX_BODY_BYTES;
            await reader.cancel();
            break;
          }
          chunks.push(value);
          totalBytes += value.byteLength;
        }
      }

      const combined = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.byteLength;
      }
      html = new TextDecoder().decode(combined);
    } else {
      html = await response.text();
    }

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
