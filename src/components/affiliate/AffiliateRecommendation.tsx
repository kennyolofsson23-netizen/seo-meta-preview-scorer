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
  const showAhrefs = keywordScore < 70;
  const showSemrush = overallScore < 70;

  if (!showAhrefs && !showSemrush) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        Level up your SEO
      </p>

      {showAhrefs && (
        <AffiliateCard
          href={AFFILIATES.ahrefs}
          title="Ahrefs — Find Keywords That Actually Convert"
          description="Your keyword isn't landing where it should. Ahrefs shows you which terms drive real traffic and exactly where to place them for maximum impact."
          cta="Try Ahrefs free →"
        />
      )}

      {showSemrush && (
        <AffiliateCard
          href={AFFILIATES.semrush}
          title="Semrush — Fix What's Really Hurting Your Rankings"
          description="An SEO score below 70 usually means more is broken than just the meta tags. Semrush's site audit finds technical issues, thin content, and link gaps across your whole site."
          cta="Try Semrush free →"
        />
      )}
    </div>
  );
}
