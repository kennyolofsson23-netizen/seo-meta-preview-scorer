/**
 * Bulk CSV processing for SEO metadata scoring
 */

import {
  scoreTitle,
  scoreDescription,
  scoreKeywordPresence,
  calculateOverallScore,
} from "@/lib/scoring";

export interface BulkInputRow {
  title: string;
  description: string;
  url: string;
  keyword?: string;
}

export interface BulkResultRow extends BulkInputRow {
  titleScore: number;
  titleStatus: "good" | "warning" | "error";
  titleMessage: string;
  descriptionScore: number;
  descriptionStatus: "good" | "warning" | "error";
  descriptionMessage: string;
  keywordScore: number;
  keywordStatus: "good" | "warning" | "error";
  overallScore: number;
}

/**
 * Parse CSV text into an array of BulkInputRows
 * Supports comma-separated values with optional quotes
 */
export function parseCsv(csvText: string): BulkInputRow[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const titleIdx = headers.indexOf("title");
  const descIdx = headers.indexOf("description");
  const urlIdx = headers.indexOf("url");
  const keywordIdx = headers.indexOf("keyword");

  if (titleIdx === -1) return []; // title column required

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const cols = parseCSVLine(line);
      return {
        title: cols[titleIdx] ?? "",
        description: descIdx >= 0 ? (cols[descIdx] ?? "") : "",
        url: urlIdx >= 0 ? (cols[urlIdx] ?? "") : "",
        keyword: keywordIdx >= 0 ? (cols[keywordIdx] ?? "") : undefined,
      };
    });
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Score a single row
 */
export function scoreBulkRow(row: BulkInputRow): BulkResultRow {
  const titleResult = scoreTitle(row.title);
  const descResult = scoreDescription(row.description);
  const kwResult = scoreKeywordPresence(
    row.title,
    row.description,
    row.keyword ?? "",
  );
  const overall = calculateOverallScore(
    titleResult.score,
    descResult.score,
    kwResult.score,
  );

  return {
    ...row,
    titleScore: titleResult.score,
    titleStatus: titleResult.status,
    titleMessage: titleResult.message,
    descriptionScore: descResult.score,
    descriptionStatus: descResult.status,
    descriptionMessage: descResult.message,
    keywordScore: kwResult.score,
    keywordStatus: kwResult.status,
    overallScore: overall,
  };
}

/**
 * Process up to 500 rows
 */
export function processBulkRows(rows: BulkInputRow[]): BulkResultRow[] {
  return rows.slice(0, 500).map(scoreBulkRow);
}

/**
 * Export results as CSV string
 */
export function exportResultsToCsv(results: BulkResultRow[]): string {
  const headers = [
    "Title",
    "Description",
    "URL",
    "Keyword",
    "Overall Score",
    "Title Score",
    "Title Status",
    "Title Feedback",
    "Description Score",
    "Description Status",
    "Description Feedback",
    "Keyword Score",
    "Keyword Status",
  ];

  const rows = results.map((r) => [
    csvEscape(r.title),
    csvEscape(r.description),
    csvEscape(r.url),
    csvEscape(r.keyword ?? ""),
    r.overallScore,
    r.titleScore,
    r.titleStatus,
    csvEscape(r.titleMessage),
    r.descriptionScore,
    r.descriptionStatus,
    csvEscape(r.descriptionMessage),
    r.keywordScore,
    r.keywordStatus,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Trigger CSV file download
 */
export function downloadCsv(
  csvContent: string,
  filename: string = "seo-bulk-results.csv",
): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
