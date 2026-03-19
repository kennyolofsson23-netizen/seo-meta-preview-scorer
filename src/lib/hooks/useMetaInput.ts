"use client";

import { useState } from "react";
import { type PageMetadata } from "@/types";
import {
  scoreTitle,
  scoreDescription,
  scoreKeywordPresence,
  calculateOverallScore,
  validateUrl,
} from "@/lib/scoring";
import { EXAMPLES, SCORING } from "@/lib/constants";

export interface MobileTruncation {
  titleTruncated: boolean;
  descriptionTruncated: boolean;
  hasIssues: boolean;
}

export interface UseMetaInputReturn {
  metadata: PageMetadata;
  setMetadata: (metadata: PageMetadata) => void;
  titleScore: ReturnType<typeof scoreTitle>;
  descriptionScore: ReturnType<typeof scoreDescription>;
  keywordScore: ReturnType<typeof scoreKeywordPresence>;
  overall: number;
  urlValidation: ReturnType<typeof validateUrl>;
  mobileTruncation: MobileTruncation;
}

const DEFAULT_METADATA: PageMetadata = {
  title: EXAMPLES.title,
  description: EXAMPLES.description,
  url: EXAMPLES.url,
  keyword: EXAMPLES.keyword,
};

export function useMetaInput(
  initial?: Partial<PageMetadata>,
): UseMetaInputReturn {
  const [metadata, setMetadata] = useState<PageMetadata>({
    ...DEFAULT_METADATA,
    ...initial,
  });

  const titleScore = scoreTitle(metadata.title);
  const descriptionScore = scoreDescription(metadata.description);
  const keywordScore = scoreKeywordPresence(
    metadata.title,
    metadata.description,
    metadata.keyword ?? "",
  );
  const overall = calculateOverallScore(
    titleScore.score,
    descriptionScore.score,
    keywordScore.score,
  );
  const urlValidation = validateUrl(metadata.url);

  const titleTruncated = metadata.title.length > SCORING.mobileTitle;
  const descriptionTruncated =
    metadata.description.length > SCORING.mobileDescription;
  const mobileTruncation: MobileTruncation = {
    titleTruncated,
    descriptionTruncated,
    hasIssues: titleTruncated || descriptionTruncated,
  };

  return {
    metadata,
    setMetadata,
    titleScore,
    descriptionScore,
    keywordScore,
    overall,
    urlValidation,
    mobileTruncation,
  };
}
