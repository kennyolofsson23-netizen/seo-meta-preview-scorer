"use client";

import { ExternalLink } from "lucide-react";
import { AFFILIATES } from "@/lib/constants";

interface AffiliateRecommendationProps {
  keywordScore: number;
  overallScore: number;
}

interface AffiliateCardProps {
  href: string;
  title: string;
  description: string;
  cta: string;
}

function AffiliateCard({ href, title, description, cta }: AffiliateCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener sponsored"
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-primary whitespace-nowrap flex-shrink-0 group-hover:underline">
        {cta}
        <ExternalLink className="h-3 w-3" />
      </div>
    </a>
  );
}

export function AffiliateRecommendation({
  keywordScore,
  overallScore,
}: AffiliateRecommendationProps) {
  const showSemrush = overallScore < 80;
  const showMangools = overallScore < 70;

  if (!showSemrush && !showMangools) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        Level up your SEO
      </p>

      {showSemrush && (
        <AffiliateCard
          href={AFFILIATES.semrush}
          title="Semrush — The All-in-One SEO Toolkit"
          description="Go beyond meta tags. Semrush gives you keyword research, site audits, competitor analysis, and rank tracking — everything you need to dominate search."
          cta="Try Semrush free →"
        />
      )}

      {showMangools && (
        <AffiliateCard
          href={AFFILIATES.mangools}
          title="Mangools — Find Keywords You Can Actually Rank For"
          description="An SEO score below 70 means you need more than meta tag fixes. Mangools shows you low-competition keywords, tracks your rankings, and audits your whole site."
          cta="Try Mangools free →"
        />
      )}
    </div>
  );
}
