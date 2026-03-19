import { describe, it, expect } from "vitest";
import { generateEmbedCode, parseWidgetOptions } from "./embed";

describe("embed", () => {
  describe("generateEmbedCode", () => {
    it("generates basic embed code with no options", () => {
      const code = generateEmbedCode();
      expect(code).toContain("<iframe");
      expect(code).toContain("/embed");
      expect(code).toContain('width="100%"');
      expect(code).toContain('frameborder="0"');
    });

    it("includes showScores=false param when scores disabled", () => {
      const code = generateEmbedCode({ showScores: false });
      expect(code).toContain("showScores=false");
    });

    it("includes compact=true param when compact mode", () => {
      const code = generateEmbedCode({ compactMode: true });
      expect(code).toContain("compact=true");
    });

    it("encodes default title in URL params", () => {
      const code = generateEmbedCode({ defaultTitle: "My Test Title" });
      expect(code).toContain("title=My+Test+Title");
    });

    it("uses smaller height for compact mode", () => {
      const compactCode = generateEmbedCode({ compactMode: true });
      const normalCode = generateEmbedCode({ compactMode: false });
      expect(compactCode).toContain('height="450"');
      expect(normalCode).toContain('height="700"');
    });

    it("includes powered-by in title attribute", () => {
      const code = generateEmbedCode();
      expect(code).toContain("SEO Meta Preview");
    });
  });

  describe("parseWidgetOptions", () => {
    it("parses showScores=false", () => {
      const params = new URLSearchParams("showScores=false");
      const options = parseWidgetOptions(params);
      expect(options.showScores).toBe(false);
    });

    it("parses compact=true", () => {
      const params = new URLSearchParams("compact=true");
      const options = parseWidgetOptions(params);
      expect(options.compactMode).toBe(true);
    });

    it("parses title param", () => {
      const params = new URLSearchParams("title=My+Title");
      const options = parseWidgetOptions(params);
      expect(options.defaultTitle).toBe("My Title");
    });

    it("returns empty options for empty params", () => {
      const params = new URLSearchParams();
      const options = parseWidgetOptions(params);
      expect(Object.keys(options)).toHaveLength(0);
    });

    it("parses showPreviews=false", () => {
      const params = new URLSearchParams("showPreviews=false");
      const options = parseWidgetOptions(params);
      expect(options.showPreviews).toBe(false);
    });

    it("parses description param", () => {
      const params = new URLSearchParams(
        "description=My+meta+description+here",
      );
      const options = parseWidgetOptions(params);
      expect(options.defaultDescription).toBe("My meta description here");
    });

    it("parses url param", () => {
      const params = new URLSearchParams(
        "url=https%3A%2F%2Fexample.com%2Fpage",
      );
      const options = parseWidgetOptions(params);
      expect(options.defaultUrl).toBe("https://example.com/page");
    });

    it("parses all params together", () => {
      const params = new URLSearchParams(
        "showScores=false&showPreviews=false&compact=true&title=T&description=D&url=https%3A%2F%2Fx.com",
      );
      const options = parseWidgetOptions(params);
      expect(options.showScores).toBe(false);
      expect(options.showPreviews).toBe(false);
      expect(options.compactMode).toBe(true);
      expect(options.defaultTitle).toBe("T");
      expect(options.defaultDescription).toBe("D");
      expect(options.defaultUrl).toBe("https://x.com");
    });

    it("does not set showScores when the param is absent", () => {
      const params = new URLSearchParams("compact=true");
      const options = parseWidgetOptions(params);
      expect(options.showScores).toBeUndefined();
    });
  });

  // ─── generateEmbedCode additional cases ──────────────────────────────────────

  describe("generateEmbedCode additional cases", () => {
    it("includes showPreviews=false when showPreviews is false", () => {
      const code = generateEmbedCode({ showPreviews: false });
      expect(code).toContain("showPreviews=false");
    });

    it("does NOT include showPreviews param when showPreviews is not explicitly false", () => {
      const code = generateEmbedCode({});
      expect(code).not.toContain("showPreviews");
    });

    it("encodes defaultDescription in URL params", () => {
      const code = generateEmbedCode({
        defaultDescription: "My meta description",
      });
      expect(code).toContain("description=");
    });

    it("encodes defaultUrl in URL params", () => {
      const code = generateEmbedCode({ defaultUrl: "https://example.com" });
      expect(code).toContain("url=");
    });

    it("generates no query string when no options are given", () => {
      const code = generateEmbedCode();
      // The URL should end with /embed" not /embed?" with nothing after
      expect(code).toMatch(/\/embed"/);
    });

    it("generates a query string when at least one option is present", () => {
      const code = generateEmbedCode({ compactMode: true });
      expect(code).toContain("?");
    });

    it("uses loading=lazy on the iframe", () => {
      const code = generateEmbedCode();
      expect(code).toContain('loading="lazy"');
    });

    it("includes border styling in the style attribute", () => {
      const code = generateEmbedCode();
      expect(code).toContain("border");
    });

    it("combines multiple options into a single query string", () => {
      const code = generateEmbedCode({
        showScores: false,
        compactMode: true,
        defaultTitle: "Test",
      });
      expect(code).toContain("showScores=false");
      expect(code).toContain("compact=true");
      expect(code).toContain("title=Test");
    });
  });
});
