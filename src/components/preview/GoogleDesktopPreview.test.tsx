import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoogleDesktopPreview } from "./GoogleDesktopPreview";

describe("GoogleDesktopPreview", () => {
  const defaultProps = {
    title: "Example Page Title | My Website",
    description:
      "This is an example meta description that helps visitors understand the page.",
    url: "https://example.com/sample-page",
    keyword: "",
  };

  it("renders the title", () => {
    render(<GoogleDesktopPreview {...defaultProps} />);
    expect(screen.getByText(/Example Page Title/)).toBeTruthy();
  });

  it("renders the description", () => {
    render(<GoogleDesktopPreview {...defaultProps} />);
    expect(screen.getByText(/example meta description/)).toBeTruthy();
  });

  it("renders the domain from URL", () => {
    render(<GoogleDesktopPreview {...defaultProps} />);
    expect(screen.getByText(/example\.com/)).toBeTruthy();
  });

  it("shows breadcrumb from URL path", () => {
    render(<GoogleDesktopPreview {...defaultProps} />);
    expect(screen.getByText(/sample-page/)).toBeTruthy();
  });

  it("truncates long titles at 60 chars", () => {
    const longTitle = "A".repeat(80);
    render(<GoogleDesktopPreview {...defaultProps} title={longTitle} />);
    // Truncated title should contain ellipsis
    expect(document.body.textContent).toContain("…");
  });

  it("truncates long descriptions at 160 chars", () => {
    const longDesc = "A".repeat(200);
    render(<GoogleDesktopPreview {...defaultProps} description={longDesc} />);
    expect(document.body.textContent).toContain("…");
  });

  it('shows "Untitled" for empty title', () => {
    render(<GoogleDesktopPreview {...defaultProps} title="" />);
    expect(screen.getByText("Untitled")).toBeTruthy();
  });

  it("shows example.com for empty URL", () => {
    render(<GoogleDesktopPreview {...defaultProps} url="" />);
    expect(screen.getByText(/example\.com/)).toBeTruthy();
  });

  it("bolds keyword in title when keyword provided", () => {
    render(<GoogleDesktopPreview {...defaultProps} keyword="Example Page" />);
    const bold = document.querySelector("strong");
    expect(bold).toBeTruthy();
  });

  it("has proper aria label", () => {
    const { container } = render(<GoogleDesktopPreview {...defaultProps} />);
    const el = container.querySelector(
      '[aria-label="Google search result preview"]',
    );
    expect(el).toBeTruthy();
  });

  it("does not render a description paragraph when description is empty", () => {
    const { container } = render(
      <GoogleDesktopPreview {...defaultProps} description="" />,
    );
    // No <p> element since description is empty
    expect(container.querySelector("p")).toBeNull();
  });

  it("bolds keyword in description when keyword provided", () => {
    render(
      <GoogleDesktopPreview {...defaultProps} keyword="meta description" />,
    );
    const bolds = document.querySelectorAll("strong");
    expect(bolds.length).toBeGreaterThan(0);
  });

  it("renders breadcrumb separator › when URL has a path", () => {
    render(<GoogleDesktopPreview {...defaultProps} />);
    expect(document.body.textContent).toContain("›");
  });

  it("does not render breadcrumb separator when URL has no path", () => {
    render(
      <GoogleDesktopPreview {...defaultProps} url="https://example.com" />,
    );
    expect(document.body.textContent).not.toContain("›");
  });
});
