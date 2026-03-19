import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const MAX_TITLE_LEN = 70;
const MAX_DESC_LEN = 200;

function clampScore(raw: string | null): number | null {
  if (raw === null) return null;
  const n = parseInt(raw, 10);
  // isNaN guard: default invalid (NaN/Infinity) score to 0 so it renders red
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get("title") ?? "SEO Meta Preview & Scorer";
  const title = rawTitle.slice(0, MAX_TITLE_LEN);
  const rawDescription =
    searchParams.get("description") ??
    "Pixel-perfect SEO preview and real-time scoring";
  const description = rawDescription.slice(0, MAX_DESC_LEN);
  const scoreNum = clampScore(searchParams.get("score"));
  const score = scoreNum !== null ? String(scoreNum) : null;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        fontFamily: "system-ui, sans-serif",
        padding: "60px",
      }}
    >
      {/* Branding */}
      <div
        style={{
          color: "#64748b",
          fontSize: "18px",
          marginBottom: "20px",
          display: "flex",
        }}
      >
        SEO Meta Preview & Scorer
      </div>

      {/* Title */}
      <div
        style={{
          color: "#f8fafc",
          fontSize: score ? "36px" : "52px",
          fontWeight: "bold",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: "900px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {title}
      </div>

      {/* Score if provided */}
      {score && (
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "96px",
              fontWeight: "bold",
              color:
                scoreNum! >= 80
                  ? "#22c55e"
                  : scoreNum! >= 50
                    ? "#eab308"
                    : "#ef4444",
              lineHeight: 1,
              display: "flex",
            }}
          >
            {score}
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: "36px",
              display: "flex",
              alignItems: "flex-end",
              paddingBottom: "12px",
            }}
          >
            /100
          </div>
        </div>
      )}

      {/* Description */}
      {!score && (
        <div
          style={{
            color: "#94a3b8",
            fontSize: "22px",
            textAlign: "center",
            marginTop: "20px",
            maxWidth: "800px",
            display: "flex",
          }}
        >
          {description}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          color: "#475569",
          fontSize: "16px",
          display: "flex",
        }}
      >
        Free · Zero API calls · 100% client-side
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
