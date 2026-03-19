import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileTruncationWarning } from "./MobileTruncationWarning";

describe("MobileTruncationWarning", () => {
  // ── Render nothing when no issues ─────────────────────────────────────────
  it("renders nothing when both flags are false", () => {
    const { container } = render(
      <MobileTruncationWarning
        titleTruncated={false}
        descriptionTruncated={false}
        titleLength={30}
        descriptionLength={100}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("does not render role=alert when there are no issues", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={false}
        descriptionTruncated={false}
        titleLength={30}
        descriptionLength={100}
      />,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ── Title truncation ──────────────────────────────────────────────────────
  it("renders alert when only title is truncated", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={true}
        descriptionTruncated={false}
        titleLength={55}
        descriptionLength={100}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows the title character count in the warning message", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={true}
        descriptionTruncated={false}
        titleLength={55}
        descriptionLength={100}
      />,
    );
    expect(screen.getByText(/55 chars/)).toBeInTheDocument();
  });

  it("mentions the 50-char mobile limit for the title", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={true}
        descriptionTruncated={false}
        titleLength={55}
        descriptionLength={100}
      />,
    );
    expect(screen.getByText(/cuts off at 50/)).toBeInTheDocument();
  });

  it("does NOT show a description warning when only title is truncated", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={true}
        descriptionTruncated={false}
        titleLength={55}
        descriptionLength={100}
      />,
    );
    expect(screen.queryByText(/120 chars/)).not.toBeInTheDocument();
  });

  // ── Description truncation ────────────────────────────────────────────────
  it("renders alert when only description is truncated", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={false}
        descriptionTruncated={true}
        titleLength={30}
        descriptionLength={130}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows description character count in the warning", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={false}
        descriptionTruncated={true}
        titleLength={30}
        descriptionLength={130}
      />,
    );
    expect(screen.getByText(/130 chars/)).toBeInTheDocument();
  });

  it("mentions the 120-char mobile limit for description", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={false}
        descriptionTruncated={true}
        titleLength={30}
        descriptionLength={130}
      />,
    );
    expect(screen.getByText(/cuts off at 120/)).toBeInTheDocument();
  });

  // ── Both truncated ────────────────────────────────────────────────────────
  it("renders one alert when both are truncated", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={true}
        descriptionTruncated={true}
        titleLength={55}
        descriptionLength={130}
      />,
    );
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("shows both character counts when both are truncated", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={true}
        descriptionTruncated={true}
        titleLength={55}
        descriptionLength={130}
      />,
    );
    expect(screen.getByText(/55 chars/)).toBeInTheDocument();
    expect(screen.getByText(/130 chars/)).toBeInTheDocument();
  });

  it("shows 'Mobile Truncation Warning' heading", () => {
    render(
      <MobileTruncationWarning
        titleTruncated={true}
        descriptionTruncated={false}
        titleLength={55}
        descriptionLength={100}
      />,
    );
    expect(screen.getByText(/Mobile Search Will Cut This Off/i)).toBeInTheDocument();
  });
});
