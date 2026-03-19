import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverallScoreGauge } from "./OverallScoreGauge";

describe("OverallScoreGauge", () => {
  describe("score rendering", () => {
    it("renders the score number", () => {
      render(<OverallScoreGauge overall={75} />);
      expect(screen.getByText("75")).toBeInTheDocument();
    });

    it("renders the /100 suffix", () => {
      render(<OverallScoreGauge overall={75} />);
      expect(screen.getByText("/100")).toBeInTheDocument();
    });

    it("renders the heading", () => {
      render(<OverallScoreGauge overall={75} />);
      expect(screen.getByText("Overall SEO Score")).toBeInTheDocument();
    });

    it("renders the weighting note", () => {
      render(<OverallScoreGauge overall={75} />);
      expect(
        screen.getByText("Title 40% · Description 40% · Keyword 20%"),
      ).toBeInTheDocument();
    });

    it("clamps score above 100 to 100", () => {
      render(<OverallScoreGauge overall={120} />);
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("clamps score below 0 to 0", () => {
      render(<OverallScoreGauge overall={-10} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("progressbar aria attributes", () => {
    it('has role="progressbar"', () => {
      render(<OverallScoreGauge overall={60} />);
      const bar = screen.getByRole("progressbar");
      expect(bar).toBeInTheDocument();
    });

    it("has correct aria-valuenow", () => {
      render(<OverallScoreGauge overall={60} />);
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "60");
    });

    it("has aria-valuemin of 0", () => {
      render(<OverallScoreGauge overall={60} />);
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
    });

    it("has aria-valuemax of 100", () => {
      render(<OverallScoreGauge overall={60} />);
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    });

    it("reflects clamped value in aria-valuenow when over 100", () => {
      render(<OverallScoreGauge overall={150} />);
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "100");
    });
  });

  describe("color coding", () => {
    it("applies green color class for score >= 80", () => {
      render(<OverallScoreGauge overall={85} />);
      const scoreEl = screen.getByText("85");
      expect(scoreEl.className).toMatch(/green/);
    });

    it("applies yellow color class for score 50-79", () => {
      render(<OverallScoreGauge overall={65} />);
      const scoreEl = screen.getByText("65");
      expect(scoreEl.className).toMatch(/yellow/);
    });

    it("applies red color class for score < 50", () => {
      render(<OverallScoreGauge overall={30} />);
      const scoreEl = screen.getByText("30");
      expect(scoreEl.className).toMatch(/red/);
    });

    it("applies green for exact score of 80", () => {
      render(<OverallScoreGauge overall={80} />);
      const scoreEl = screen.getByText("80");
      expect(scoreEl.className).toMatch(/green/);
    });

    it("applies yellow for exact score of 50", () => {
      render(<OverallScoreGauge overall={50} />);
      const scoreEl = screen.getByText("50");
      expect(scoreEl.className).toMatch(/yellow/);
    });
  });
});
