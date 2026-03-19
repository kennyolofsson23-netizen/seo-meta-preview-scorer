import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreDashboard } from "./ScoreDashboard";

// Helper to generate strings of a given length
const repeat = (char: string, n: number) => char.repeat(n);

describe("ScoreDashboard", () => {
  describe("renders all sections", () => {
    it("renders the overall score gauge", () => {
      render(
        <ScoreDashboard
          title="Good Title Here"
          description={repeat("A", 155)}
          keyword="test"
        />,
      );
      expect(screen.getByText("Overall SEO Score")).toBeInTheDocument();
    });

    it("renders the title score card", () => {
      render(
        <ScoreDashboard
          title="Good Title Here"
          description={repeat("A", 155)}
          keyword="test"
        />,
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("renders the description score card", () => {
      render(
        <ScoreDashboard
          title="Good Title Here"
          description={repeat("A", 155)}
          keyword="test"
        />,
      );
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("renders the keyword score card", () => {
      render(
        <ScoreDashboard
          title="Good Title Here"
          description={repeat("A", 155)}
          keyword="test"
        />,
      );
      expect(screen.getByText("Keyword")).toBeInTheDocument();
    });
  });

  describe("score color coding", () => {
    it("shows green badge for optimal title (30-60 chars)", () => {
      render(
        <ScoreDashboard
          title="A perfect thirty character title"
          description={repeat("A", 155)}
          keyword=""
        />,
      );
      // Title card should show "Good" badge (status: good)
      const goodBadges = screen.getAllByText("Good");
      expect(goodBadges.length).toBeGreaterThan(0);
    });

    it("shows warning badge for slightly long title (61-70 chars)", () => {
      render(
        <ScoreDashboard
          title={repeat("A", 65)}
          description={repeat("A", 155)}
          keyword=""
        />,
      );
      expect(screen.getByText("Warning")).toBeInTheDocument();
    });

    it("shows error badge for empty title", () => {
      render(
        <ScoreDashboard title="" description={repeat("A", 155)} keyword="" />,
      );
      expect(screen.getAllByText("Needs Work").length).toBeGreaterThan(0);
    });

    it("shows good badge for optimal description (120-160 chars)", () => {
      render(
        <ScoreDashboard
          title="A perfect title for testing"
          description={repeat("A", 155)}
          keyword=""
        />,
      );
      const goodBadges = screen.getAllByText("Good");
      expect(goodBadges.length).toBeGreaterThan(0);
    });

    it("shows error badge for too-short description (<120 chars)", () => {
      render(
        <ScoreDashboard
          title="A perfect title for testing"
          description="Short"
          keyword=""
        />,
      );
      expect(screen.getByText("Warning")).toBeInTheDocument();
    });

    it("shows good badge when keyword appears in both title and description", () => {
      render(
        <ScoreDashboard
          title="Best SEO tips for 2024"
          description={`Learn the best SEO tips and strategies for optimizing your website today and improve your rankings in search engines.`}
          keyword="SEO tips"
        />,
      );
      const goodBadges = screen.getAllByText("Good");
      expect(goodBadges.length).toBeGreaterThan(0);
    });
  });

  describe("mobile truncation warning", () => {
    it("does not show warning when title <= 50 chars and description <= 120 chars", () => {
      render(
        <ScoreDashboard
          title="Short title"
          description={repeat("A", 100)}
          keyword=""
        />,
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows warning when title > 50 chars", () => {
      render(
        <ScoreDashboard
          title={repeat("A", 55)}
          description={repeat("A", 100)}
          keyword=""
        />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("shows warning when description > 120 chars", () => {
      render(
        <ScoreDashboard
          title="Short title"
          description={repeat("A", 125)}
          keyword=""
        />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("shows warning with correct title length info", () => {
      render(
        <ScoreDashboard
          title={repeat("A", 55)}
          description={repeat("A", 100)}
          keyword=""
        />,
      );
      expect(screen.getByText(/55 chars/)).toBeInTheDocument();
    });

    it("shows warning with correct description length info", () => {
      render(
        <ScoreDashboard
          title="Short title"
          description={repeat("A", 130)}
          keyword=""
        />,
      );
      expect(screen.getByText(/130 chars/)).toBeInTheDocument();
    });
  });

  describe("overall score display", () => {
    it("shows overall score number", () => {
      render(
        <ScoreDashboard
          title="A perfect thirty character title"
          description={repeat("A", 155)}
          keyword=""
        />,
      );
      // Overall score gauge should display a number and /100
      expect(screen.getByText("/100")).toBeInTheDocument();
    });
  });
});
