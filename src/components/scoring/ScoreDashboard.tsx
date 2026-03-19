"use client";

import * as React from "react";
import { useScores } from "@/lib/hooks/useScores";
import { OverallScoreGauge } from "./OverallScoreGauge";
import { ScoreCard } from "./ScoreCard";
import { MobileTruncationWarning } from "./MobileTruncationWarning";

export interface ScoreDashboardProps {
  title: string;
  description: string;
  keyword: string;
}

export function ScoreDashboard({
  title,
  description,
  keyword,
}: ScoreDashboardProps) {
  const {
    titleScore,
    descriptionScore,
    keywordScore,
    overall,
    mobileTruncation,
  } = useScores({
    title,
    description,
    keyword,
  });

  return (
    <div className="flex flex-col gap-4">
      <OverallScoreGauge overall={overall} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreCard
          label="Title"
          score={titleScore.score}
          status={titleScore.status}
          message={titleScore.message}
          charCount={title.length}
          charLimit={60}
        />
        <ScoreCard
          label="Description"
          score={descriptionScore.score}
          status={descriptionScore.status}
          message={descriptionScore.message}
          charCount={description.length}
          charLimit={160}
        />
        <ScoreCard
          label="Keyword"
          score={keywordScore.score}
          status={keywordScore.status}
          message={keywordScore.message}
        />
      </div>

      {mobileTruncation.totalIssues > 0 && (
        <MobileTruncationWarning
          titleTruncated={mobileTruncation.titleTruncated}
          descriptionTruncated={mobileTruncation.descriptionTruncated}
          titleLength={mobileTruncation.titleLength}
          descriptionLength={mobileTruncation.descriptionLength}
        />
      )}
    </div>
  );
}
