import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreCard } from "./ScoreCard";

describe("ScoreCard", () => {
  const base = {
    label: "Title",
    score: 100,
    status: "good" as const,
    message: "Perfect length. Highly clickable.",
  };

  // ── Rendering basics ──────────────────────────────────────────────────────
  it("renders the label text", () => {
    render(<ScoreCard {...base} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders the message text", () => {
    render(<ScoreCard {...base} />);
    expect(screen.getByText(/Perfect length/)).toBeInTheDocument();
  });

  // ── Badge status labels ───────────────────────────────────────────────────
  it("shows 'Optimal' badge for good status", () => {
    render(<ScoreCard {...base} status="good" />);
    expect(screen.getByText("Optimal")).toBeInTheDocument();
  });

  it("shows 'Improve' badge for warning status", () => {
    render(<ScoreCard {...base} status="warning" message="Slightly long" />);
    expect(screen.getByText("Improve")).toBeInTheDocument();
  });

  it("shows 'Fix It' badge for error status", () => {
    render(<ScoreCard {...base} status="error" message="Too short" />);
    expect(screen.getByText("Fix It")).toBeInTheDocument();
  });

  // ── Character count display ───────────────────────────────────────────────
  it("renders character count alone when only charCount is given", () => {
    render(<ScoreCard {...base} charCount={45} />);
    expect(screen.getByText(/45.*chars/)).toBeInTheDocument();
  });

  it("renders 'count/limit chars' when both charCount and charLimit given", () => {
    render(<ScoreCard {...base} charCount={45} charLimit={60} />);
    expect(screen.getByText("45/60 chars")).toBeInTheDocument();
  });

  it("does not render character count section when neither prop is given", () => {
    render(<ScoreCard {...base} />);
    expect(screen.queryByText(/chars/)).not.toBeInTheDocument();
  });

  // ── Different labels ──────────────────────────────────────────────────────
  it("renders 'Description' label correctly", () => {
    render(
      <ScoreCard
        label="Description"
        score={80}
        status="warning"
        message="Slightly long"
      />,
    );
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders 'Keyword' label correctly", () => {
    render(
      <ScoreCard
        label="Keyword"
        score={0}
        status="error"
        message="Keyword not found"
      />,
    );
    expect(screen.getByText("Keyword")).toBeInTheDocument();
  });

  // ── Score values ──────────────────────────────────────────────────────────
  it("renders without crashing for score 0", () => {
    render(<ScoreCard {...base} score={0} status="error" />);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders without crashing for score above 100 (clamped to 100)", () => {
    render(<ScoreCard {...base} score={150} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders without crashing for negative score (clamped to 0)", () => {
    render(<ScoreCard {...base} score={-20} status="error" />);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  // ── charLimit without charCount ───────────────────────────────────────────
  it("does not render char count when charCount is undefined even if charLimit given", () => {
    render(<ScoreCard {...base} charLimit={60} />);
    expect(screen.queryByText(/\/60/)).not.toBeInTheDocument();
  });
});
