import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoogleMobilePreview } from "./GoogleMobilePreview";

describe("GoogleMobilePreview", () => {
  const defaultProps = {
    title: "Example Page Title | My Website",
    description: "This is an example meta description.",
    url: "https://example.com/sample-page",
    keyword: "",
    showPhoneFrame: false,
  };

  it("renders without phone frame", () => {
    const { container } = render(
      <GoogleMobilePreview {...defaultProps} showPhoneFrame={false} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders title", () => {
    render(<GoogleMobilePreview {...defaultProps} />);
    expect(screen.getByText(/Example Page Title/)).toBeTruthy();
  });

  it("renders description", () => {
    render(<GoogleMobilePreview {...defaultProps} />);
    expect(screen.getByText(/example meta description/)).toBeTruthy();
  });

  it("truncates title at 50 chars", () => {
    const longTitle = "A".repeat(60);
    render(<GoogleMobilePreview {...defaultProps} title={longTitle} />);
    expect(document.body.textContent).toContain("…");
  });

  it("truncates description at 120 chars", () => {
    const longDesc = "A".repeat(150);
    render(<GoogleMobilePreview {...defaultProps} description={longDesc} />);
    expect(document.body.textContent).toContain("…");
  });

  it("shows mobile truncation warning when title > 50 chars", () => {
    const longTitle = "A".repeat(60);
    render(
      <GoogleMobilePreview
        title={longTitle}
        description="Short"
        url="https://example.com"
        showPhoneFrame={true}
      />,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Content cut off on mobile/)).toBeTruthy();
  });

  it("does not show warning when content within limits", () => {
    render(
      <GoogleMobilePreview
        title="Short title"
        description="Short desc"
        url="https://example.com"
        showPhoneFrame={true}
      />,
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it('shows "Untitled" for empty title', () => {
    render(<GoogleMobilePreview {...defaultProps} title="" />);
    expect(screen.getByText("Untitled")).toBeTruthy();
  });

  it("has correct aria label", () => {
    const { container } = render(<GoogleMobilePreview {...defaultProps} />);
    const el = container.querySelector(
      '[aria-label="Google mobile search result preview"]',
    );
    expect(el).toBeTruthy();
  });

  it("shows phone frame elements when showPhoneFrame is true", () => {
    render(
      <GoogleMobilePreview
        title="Title"
        description="Description"
        url="https://example.com"
        showPhoneFrame={true}
      />,
    );
    // Status bar time
    expect(screen.getByText("9:41")).toBeTruthy();
  });
});
