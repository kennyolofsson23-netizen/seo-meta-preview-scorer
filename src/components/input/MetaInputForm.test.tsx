import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MetaInputForm } from "./MetaInputForm";
import {
  scoreTitle,
  scoreDescription,
  scoreKeywordPresence,
  validateUrl,
} from "@/lib/scoring";
import { EXAMPLES } from "@/lib/constants";
import { type PageMetadata } from "@/types";

// Helper to build props for MetaInputForm using scoring utilities
function buildProps(metadata: PageMetadata) {
  const titleScore = scoreTitle(metadata.title);
  const descriptionScore = scoreDescription(metadata.description);
  const keywordScore = scoreKeywordPresence(
    metadata.title,
    metadata.description,
    metadata.keyword ?? "",
  );
  const urlValidation = validateUrl(metadata.url);
  const titleTruncated = metadata.title.length > 50;
  const descriptionTruncated = metadata.description.length > 120;
  const mobileTruncation = {
    titleTruncated,
    descriptionTruncated,
    hasIssues: titleTruncated || descriptionTruncated,
  };
  return {
    metadata,
    titleScore,
    descriptionScore,
    keywordScore,
    urlValidation,
    mobileTruncation,
  };
}

const defaultMetadata: PageMetadata = {
  title: EXAMPLES.title,
  description: EXAMPLES.description,
  url: EXAMPLES.url,
  keyword: EXAMPLES.keyword,
};

describe("MetaInputForm", () => {
  describe("empty state shows defaults", () => {
    it("renders the form with default EXAMPLES values in fields", () => {
      const onChange = vi.fn();
      const props = buildProps(defaultMetadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      expect(screen.getByDisplayValue(EXAMPLES.title)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(EXAMPLES.description),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue(EXAMPLES.url)).toBeInTheDocument();
      expect(screen.getByDisplayValue(EXAMPLES.keyword)).toBeInTheDocument();
    });
  });

  describe("title character count updates on input", () => {
    it("calls onChange when title changes", () => {
      const onChange = vi.fn();
      const props = buildProps(defaultMetadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      const titleTextarea = screen.getByLabelText(/page title/i);
      fireEvent.change(titleTextarea, { target: { value: "New Title Text" } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ title: "New Title Text" }),
      );
    });

    it("displays the current character count for the title", () => {
      const onChange = vi.fn();
      const metadata: PageMetadata = {
        ...defaultMetadata,
        title: "Hello World",
      };
      const props = buildProps(metadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      // 'Hello World' is 11 chars; CharacterCounter renders the count
      expect(screen.getByLabelText("11 characters")).toBeInTheDocument();
    });
  });

  describe("description character count updates on input", () => {
    it("calls onChange when description changes", () => {
      const onChange = vi.fn();
      const props = buildProps(defaultMetadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      const descTextarea = screen.getByLabelText(/meta description/i);
      fireEvent.change(descTextarea, {
        target: { value: "Updated description text" },
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Updated description text" }),
      );
    });

    it("displays the current character count for the description", () => {
      const onChange = vi.fn();
      const shortDesc = "Short";
      const metadata: PageMetadata = {
        ...defaultMetadata,
        description: shortDesc,
      };
      const props = buildProps(metadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      // 'Short' is 5 chars
      expect(screen.getByLabelText("5 characters")).toBeInTheDocument();
    });
  });

  describe("invalid URL shows error message", () => {
    it("shows validation error text when URL is invalid", () => {
      const onChange = vi.fn();
      const metadata: PageMetadata = {
        ...defaultMetadata,
        url: "not-a-valid-url",
      };
      const props = buildProps(metadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      expect(
        screen.getByText(/doesn't look like a valid url/i),
      ).toBeInTheDocument();
    });

    it("does not show error text for a valid URL", () => {
      const onChange = vi.fn();
      const props = buildProps(defaultMetadata); // url is 'https://example.com/sample-page'
      render(<MetaInputForm {...props} onChange={onChange} />);

      expect(
        screen.queryByText(/doesn't look like a valid url/i),
      ).not.toBeInTheDocument();
    });

    it("does not show error text for an empty URL", () => {
      const onChange = vi.fn();
      const metadata: PageMetadata = { ...defaultMetadata, url: "" };
      const props = buildProps(metadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      expect(
        screen.queryByText(/doesn't look like a valid url/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("mobile truncation banner", () => {
    it("does NOT show the mobile truncation banner when title is 50 chars or fewer", () => {
      const onChange = vi.fn();
      const metadata: PageMetadata = {
        ...defaultMetadata,
        title: "A".repeat(50),
        description: "A".repeat(100),
      };
      const props = buildProps(metadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows the mobile truncation banner when title exceeds 50 chars", () => {
      const onChange = vi.fn();
      const metadata: PageMetadata = {
        ...defaultMetadata,
        title: "A".repeat(51),
        description: "A".repeat(100), // keep description under mobile limit
      };
      const props = buildProps(metadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/cut off/i);
    });

    it("shows the mobile truncation banner when description exceeds 120 chars", () => {
      const onChange = vi.fn();
      const metadata: PageMetadata = {
        ...defaultMetadata,
        title: "Short Title",
        description: "A".repeat(121),
      };
      const props = buildProps(metadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/cut off/i);
    });

    it("shows banner mentioning both fields when both exceed mobile limits", () => {
      const onChange = vi.fn();
      const metadata: PageMetadata = {
        ...defaultMetadata,
        title: "A".repeat(51),
        description: "A".repeat(121),
      };
      const props = buildProps(metadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThanOrEqual(2);
      const alertTexts = alerts.map((a) => a.textContent).join(" ");
      expect(alertTexts).toMatch(/title/i);
      expect(alertTexts).toMatch(/description/i);
    });
  });

  describe("URL field calls onChange", () => {
    it("calls onChange when URL changes", () => {
      const onChange = vi.fn();
      const props = buildProps(defaultMetadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      const urlInput = screen.getByLabelText(/url/i);
      fireEvent.change(urlInput, { target: { value: "https://newsite.com" } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ url: "https://newsite.com" }),
      );
    });
  });

  describe("keyword field calls onChange", () => {
    it("calls onChange when keyword changes", () => {
      const onChange = vi.fn();
      const props = buildProps(defaultMetadata);
      render(<MetaInputForm {...props} onChange={onChange} />);

      const keywordInput = screen.getByLabelText(/target keyword/i);
      fireEvent.change(keywordInput, { target: { value: "new keyword" } });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: "new keyword" }),
      );
    });
  });
});
