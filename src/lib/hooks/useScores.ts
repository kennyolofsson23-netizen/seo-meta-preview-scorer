"use client";

import { useMemo } from "react";
import {
  scoreTitle,
  scoreDescription,
  scoreKeywordPresence,
  calculateOverallScore,
  checkMobileTruncation,
  type ScoringResult,
} from "@/lib/scoring";

export interface UseScoresInput {
  title: string;
  description: string;
  keyword: string;
}

export interface UseScoresReturn {
  titleScore: ScoringResult;
  descriptionScore: ScoringResult;
  keywordScore: ScoringResult;
  overall: number;
  mobileTruncation: {
    titleTruncated: boolean;
    descriptionTruncated: boolean;
    titleLength: number;
    descriptionLength: number;
    totalIssues: number;
  };
}

export function useScores(metadata: UseScoresInput): UseScoresReturn {
  const { title, description, keyword } = metadata;

  const titleScore = useMemo(() => scoreTitle(title), [title]);
  const descriptionScore = useMemo(
    () => scoreDescription(description),
    [description],
  );
  const keywordScore = useMemo(
    () => scoreKeywordPresence(title, description, keyword),
    [title, description, keyword],
  );
  const overall = useMemo(
    () =>
      calculateOverallScore(
        titleScore.score,
        descriptionScore.score,
        keywordScore.score,
      ),
    [titleScore.score, descriptionScore.score, keywordScore.score],
  );
  const mobileTruncation = useMemo(() => {
    const result = checkMobileTruncation(title, description);
    return {
      ...result,
      titleLength: title.length,
      descriptionLength: description.length,
    };
  }, [title, description]);

  return {
    titleScore,
    descriptionScore,
    keywordScore,
    overall,
    mobileTruncation,
  };
}
