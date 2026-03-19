import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterCounter } from "./CharacterCounter";

describe("CharacterCounter", () => {
  // ─── color coding ───────────────────────────────────────────────────────────

  describe("color coding", () => {
    it("shows green when count is within the optimal range", () => {
      render(
        <CharacterCounter count={45} optimalMin={30} optimal={60} max={70} />,
      );
      expect(
        screen.getByLabelText("45 characters").className,
      ).toMatch(/green/);
    });

    it("shows green when count equals optimalMin (lower boundary)", () => {
      render(
        <CharacterCounter count={30} optimalMin={30} optimal={60} max={70} />,
      );
      expect(
        screen.getByLabelText("30 characters").className,
      ).toMatch(/green/);
    });

    it("shows green when count equals optimal (upper boundary of green)", () => {
      render(
        <CharacterCounter count={60} optimalMin={30} optimal={60} max={70} />,
      );
      expect(
        screen.getByLabelText("60 characters").className,
      ).toMatch(/green/);
    });

    it("shows yellow when count is above optimal but at or below max", () => {
      render(
        <CharacterCounter count={65} optimalMin={30} optimal={60} max={70} />,
      );
      expect(
        screen.getByLabelText("65 characters").className,
      ).toMatch(/yellow/);
    });

    it("shows yellow when count equals max (upper boundary of warning)", () => {
      render(
        <CharacterCounter count={70} optimalMin={30} optimal={60} max={70} />,
      );
      expect(
        screen.getByLabelText("70 characters").className,
      ).toMatch(/yellow/);
    });

    it("shows red when count exceeds max", () => {
      render(
        <CharacterCounter count={80} optimalMin={30} optimal={60} max={70} />,
      );
      expect(
        screen.getByLabelText("80 characters").className,
      ).toMatch(/red/);
    });

    it("shows red when count is below optimalMin", () => {
      render(
        <CharacterCounter count={5} optimalMin={30} optimal={60} max={70} />,
      );
      expect(
        screen.getByLabelText("5 characters").className,
      ).toMatch(/red/);
    });

    it("defaults optimalMin to 0 — count=0 is green", () => {
      render(<CharacterCounter count={0} optimal={60} max={70} />);
      expect(
        screen.getByLabelText("0 characters").className,
      ).toMatch(/green/);
    });

    it("shows red for count=0 when optimalMin > 0", () => {
      render(
        <CharacterCounter count={0} optimalMin={10} optimal={60} max={70} />,
      );
      expect(
        screen.getByLabelText("0 characters").className,
      ).toMatch(/red/);
    });
  });

  // ─── accessibility ──────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it('has aria-live="polite" for live announcements', () => {
      render(<CharacterCounter count={10} optimal={60} max={70} />);
      expect(screen.getByLabelText("10 characters")).toHaveAttribute(
        "aria-live",
        "polite",
      );
    });

    it("has aria-label describing the character count", () => {
      render(<CharacterCounter count={42} optimal={60} max={70} />);
      expect(screen.getByLabelText("42 characters")).toBeInTheDocument();
    });

    it("updates aria-label when count changes", () => {
      const { rerender } = render(
        <CharacterCounter count={10} optimal={60} max={70} />,
      );
      expect(screen.getByLabelText("10 characters")).toBeInTheDocument();

      rerender(<CharacterCounter count={55} optimal={60} max={70} />);
      expect(screen.getByLabelText("55 characters")).toBeInTheDocument();
    });
  });

  // ─── display ────────────────────────────────────────────────────────────────

  describe("display", () => {
    it("renders the numeric count as visible text", () => {
      render(<CharacterCounter count={55} optimal={60} max={70} />);
      expect(screen.getByText("55")).toBeInTheDocument();
    });

    it("renders 0 when count is 0", () => {
      render(<CharacterCounter count={0} optimal={60} max={70} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("renders large counts without truncation", () => {
      render(<CharacterCounter count={1000} optimal={60} max={70} />);
      expect(screen.getByText("1000")).toBeInTheDocument();
    });
  });
});
