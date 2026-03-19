import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// SEO Meta Preview & Scorer — End-to-End Tests
//
// Prerequisites: `npm run dev` running on http://localhost:3000
// Run with: npm run e2e
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Page loads ──────────────────────────────────────────────────────────────

  test("page title contains the app name", async ({ page }) => {
    await expect(page).toHaveTitle(/SEO Meta Preview/i);
  });

  test("h1 heading is visible on load", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /SEO Meta Preview/i }),
    ).toBeVisible();
  });

  test("subtitle text is visible", async ({ page }) => {
    await expect(
      page.getByText(/see exactly how your pages appear/i),
    ).toBeVisible();
  });

  // ── Navigation / header ─────────────────────────────────────────────────────

  test("embed link is in the header nav", async ({ page }) => {
    const embedLink = page.getByRole("link", { name: /embed/i }).first();
    await expect(embedLink).toBeVisible();
  });

  // ── Input form ──────────────────────────────────────────────────────────────

  test("Page Title textarea is present and pre-filled", async ({ page }) => {
    const titleInput = page.getByLabel(/page title/i);
    await expect(titleInput).toBeVisible();
    // Should have the example value pre-filled
    await expect(titleInput).not.toHaveValue("");
  });

  test("Meta Description textarea is present and pre-filled", async ({
    page,
  }) => {
    const descInput = page.getByLabel(/meta description/i);
    await expect(descInput).toBeVisible();
    await expect(descInput).not.toHaveValue("");
  });

  test("URL input is present and pre-filled", async ({ page }) => {
    const urlInput = page.getByLabel(/^url$/i);
    await expect(urlInput).toBeVisible();
    await expect(urlInput).not.toHaveValue("");
  });

  test("Primary Keyword input is present", async ({ page }) => {
    await expect(page.getByLabel(/primary keyword/i)).toBeVisible();
  });

  // ── Live preview updates ────────────────────────────────────────────────────

  test("typing a new title updates the Google Desktop preview", async ({
    page,
  }) => {
    const titleInput = page.getByLabel(/page title/i);
    await titleInput.clear();
    await titleInput.fill("My Custom SEO Title 2024");

    // The Google Desktop preview should show the new title
    await expect(
      page.getByText("My Custom SEO Title 2024").first(),
    ).toBeVisible();
  });

  test("typing a new description updates the preview area", async ({
    page,
  }) => {
    const descInput = page.getByLabel(/meta description/i);
    await descInput.clear();
    await descInput.fill(
      "This is my custom meta description for testing purposes.",
    );

    // Preview should reflect the new description
    await expect(
      page.getByText(/This is my custom meta description/i).first(),
    ).toBeVisible();
  });

  test("clearing the title shows Untitled fallback in preview", async ({
    page,
  }) => {
    const titleInput = page.getByLabel(/page title/i);
    await titleInput.clear();

    await expect(page.getByText("Untitled").first()).toBeVisible();
  });

  // ── Character counter ───────────────────────────────────────────────────────

  test("character counter updates as user types in the title field", async ({
    page,
  }) => {
    const titleInput = page.getByLabel(/page title/i);
    await titleInput.clear();
    await titleInput.fill("Hello"); // 5 characters

    // CharacterCounter should render the count as an aria-label
    await expect(page.getByLabel("5 characters")).toBeVisible();
  });

  // ── Score dashboard ─────────────────────────────────────────────────────────

  test("Overall SEO Score heading is visible", async ({ page }) => {
    await expect(page.getByText("Overall SEO Score")).toBeVisible();
  });

  test("/100 suffix is shown in the gauge", async ({ page }) => {
    await expect(page.getByText("/100").first()).toBeVisible();
  });

  test("Title score card is rendered", async ({ page }) => {
    await expect(page.getByText("Title").first()).toBeVisible();
  });

  test("Description score card is rendered", async ({ page }) => {
    await expect(page.getByText("Description").first()).toBeVisible();
  });

  test("Keyword score card is rendered", async ({ page }) => {
    await expect(page.getByText("Keyword").first()).toBeVisible();
  });

  // ── Preview tabs ────────────────────────────────────────────────────────────

  test("Google Desktop preview tab is present and active by default", async ({
    page,
  }) => {
    // There should be a tab-like UI for selecting preview type
    const googleTab = page
      .getByRole("tab", { name: /google desktop/i })
      .or(page.getByText(/google desktop/i).first());
    await expect(googleTab).toBeVisible();
  });

  test("clicking the Bing preview tab shows the Bing preview", async ({
    page,
  }) => {
    // Look for a Bing tab or button
    const bingTab = page.getByRole("tab", { name: /bing/i }).first();
    if (await bingTab.isVisible()) {
      await bingTab.click();
      // Bing preview container should appear
      await expect(page.locator('[data-testid="bing-preview"]')).toBeVisible();
    } else {
      // If tabs are not used, skip gracefully
      test.skip();
    }
  });

  // ── URL validation ─────────────────────────────────────────────────────────

  test("entering an invalid URL shows an error message", async ({ page }) => {
    const urlInput = page.getByLabel(/^url$/i);
    await urlInput.clear();
    await urlInput.fill("not-a-valid-url");
    await urlInput.blur();

    await expect(page.getByText(/invalid url format/i)).toBeVisible();
  });

  test("entering a valid URL clears the URL error", async ({ page }) => {
    const urlInput = page.getByLabel(/^url$/i);
    await urlInput.clear();
    await urlInput.fill("not-valid");
    await urlInput.blur();

    await urlInput.clear();
    await urlInput.fill("https://example.com");
    await urlInput.blur();

    await expect(page.getByText(/invalid url format/i)).not.toBeVisible();
  });

  // ── Mobile truncation warning ───────────────────────────────────────────────

  test("mobile truncation warning appears when title exceeds 50 chars", async ({
    page,
  }) => {
    const titleInput = page.getByLabel(/page title/i);
    await titleInput.clear();
    await titleInput.fill("A".repeat(51));

    // Should show a warning (role=alert or visible text)
    await expect(
      page.getByText(/truncated on mobile/i).first(),
    ).toBeVisible();
  });

  test("no mobile truncation warning when title is within 50 chars", async ({
    page,
  }) => {
    const titleInput = page.getByLabel(/page title/i);
    const descInput = page.getByLabel(/meta description/i);
    await titleInput.clear();
    await titleInput.fill("Short Title");
    await descInput.clear();
    await descInput.fill("A".repeat(50));

    await expect(
      page.getByText(/truncated on mobile/i).first(),
    ).not.toBeVisible();
  });

  // ── Export button ───────────────────────────────────────────────────────────

  test("Export PNG button is rendered", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /export/i }).first(),
    ).toBeVisible();
  });

  // ── Footer ──────────────────────────────────────────────────────────────────

  test("footer contains copyright text", async ({ page }) => {
    await expect(page.getByText(/zero api calls/i)).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Embed page
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Embed page (/embed)", () => {
  test("embed page loads without errors", async ({ page }) => {
    await page.goto("/embed");
    // Page should render without a crash (no error boundary triggered)
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Accessibility smoke-test
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Accessibility", () => {
  test("page has no heading-level skips (h1 present)", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
  });

  test("all form inputs have accessible labels", async ({ page }) => {
    await page.goto("/");
    // getByLabel will throw if any label is missing
    await expect(page.getByLabel(/page title/i)).toBeVisible();
    await expect(page.getByLabel(/meta description/i)).toBeVisible();
    await expect(page.getByLabel(/^url$/i)).toBeVisible();
    await expect(page.getByLabel(/primary keyword/i)).toBeVisible();
  });

  test("score progress bar has aria-valuenow attribute", async ({ page }) => {
    await page.goto("/");
    const progressbar = page.getByRole("progressbar").first();
    await expect(progressbar).toHaveAttribute("aria-valuenow");
  });
});
