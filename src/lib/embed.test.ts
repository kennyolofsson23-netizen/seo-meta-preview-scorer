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
  });
});
