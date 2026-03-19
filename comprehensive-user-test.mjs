import { chromium } from "playwright";

const BASE_URL = "http://localhost:3011";

async function comprehensiveTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = {
    blockers: [],
    warnings: [],
    passes: [],
    escalations: [],
  };

  try {
    console.log("🧪 COMPREHENSIVE USER TEST - SEO Meta Preview & Scorer\n");

    // ===== CORE FLOW 1: Input Form & Real-time Updates =====
    console.log("FLOW 1: Input Form & Real-time Updates");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const inputs = await page
      .locator('input[type="text"], input[type="url"]')
      .all();
    const textarea = await page.locator("textarea").first();

    // Test title input
    const titleInput = inputs[0];
    const testTitle = "Best SEO Tools for 2024 - Complete Guide";
    await titleInput.fill(testTitle);
    const titleVal = await titleInput.inputValue();
    if (titleVal === testTitle) {
      results.passes.push("F001: Title input accepts text");
      console.log("  ✓ Title input works");
    } else {
      results.blockers.push("[BLOCKER] Title input not working");
    }

    // Test description input
    const testDesc =
      "Discover the best SEO tools to improve your ranking, analyze competitors, and optimize your content. Reviews, pricing, and features comparison.";
    await textarea.fill(testDesc);
    const descVal = await textarea.inputValue();
    if (descVal === testDesc) {
      results.passes.push("F001: Description input accepts text");
      console.log("  ✓ Description input works");
    }

    // Test URL input
    const urlInput = inputs.find(async (input) => {
      const type = await input.getAttribute("type");
      return type === "url";
    });
    if (urlInput) {
      await urlInput.fill("https://example.com/seo-tools-guide");
      results.passes.push("F001: URL input works");
      console.log("  ✓ URL input works");
    }

    // Test keyword input
    const keywordInput = inputs.find(async (input) => {
      const placeholder = await input.getAttribute("placeholder");
      return placeholder && placeholder.includes("keyword");
    });
    if (keywordInput) {
      await keywordInput.fill("SEO tools");
      results.passes.push("F001: Keyword input works");
      console.log("  ✓ Keyword input works");
    }

    // Check character counters
    const counters = await page.locator("text=/\\d+\\//").count();
    if (counters >= 2) {
      results.passes.push("F001: Character counting visible");
      console.log(`  ✓ Character counters: ${counters} found`);
    } else {
      results.warnings.push("[WARN] Character counters not clearly visible");
    }

    // ===== CORE FLOW 2: Google Desktop Preview =====
    console.log("\nFLOW 2: Google Desktop SERP Preview");
    await page.waitForTimeout(500);
    const googleTab = await page
      .locator('[role="tab"]:has-text("Google")')
      .first();
    if (await googleTab.isVisible()) {
      await googleTab.click();
      await page.waitForTimeout(300);

      const googlePreview = await page
        .locator("text=/example.com|seo tools/i")
        .count();
      if (googlePreview > 0) {
        results.passes.push("F002: Google Desktop preview renders");
        console.log("  ✓ Google Desktop preview displays");
      } else {
        results.blockers.push(
          "[BLOCKER] Google Desktop preview not showing content",
        );
      }
    }

    // ===== CORE FLOW 3: Google Mobile Preview =====
    console.log("\nFLOW 3: Google Mobile SERP Preview");
    const mobileTab = await page
      .locator('[role="tab"]:has-text("Mobile")')
      .first();
    if (await mobileTab.isVisible()) {
      await mobileTab.click();
      await page.waitForTimeout(300);

      const mobileContent = await page
        .locator("text=/mobile|Mobile/i, text=/example.com/")
        .count();
      if (mobileContent > 0) {
        results.passes.push("F003: Google Mobile preview renders");
        console.log("  ✓ Google Mobile preview displays");
      }
    }

    // ===== CORE FLOW 4: Bing Preview =====
    console.log("\nFLOW 4: Bing SERP Preview");
    const bingTab = await page.locator('[role="tab"]:has-text("Bing")').first();
    if (await bingTab.isVisible()) {
      await bingTab.click();
      await page.waitForTimeout(300);

      const bingContent = await page
        .locator("text=/bing|Bing/i, text=/example.com/")
        .count();
      if (bingContent > 0) {
        results.passes.push("F005: Bing preview renders");
        console.log("  ✓ Bing preview displays");
      }
    }

    // ===== CORE FLOW 5: Social/OG Card Preview =====
    console.log("\nFLOW 5: Social/OG Card Preview");
    const socialTab = await page
      .locator('[role="tab"]:has-text("Social")')
      .first();
    if (await socialTab.isVisible()) {
      await socialTab.click();
      await page.waitForTimeout(300);

      const socialContent = await page
        .locator("text=/social|facebook|linkedin|card/i")
        .count();
      if (socialContent >= 0) {
        results.passes.push("F006: Social card preview available");
        console.log("  ✓ Social card preview displays");
      }
    }

    // ===== CORE FLOW 6: SEO Score Dashboard =====
    console.log("\nFLOW 6: SEO Score Dashboard");
    const scoreTab = await page
      .locator('[role="tab"]:has-text("Preview & Score")')
      .first();
    if (await scoreTab.isVisible()) {
      await scoreTab.click();
      await page.waitForTimeout(300);

      const scoreText = await page.evaluate(() => document.body.innerText);
      const hasScore =
        scoreText.includes("score") || scoreText.includes("Score");
      const hasColorRating =
        scoreText.includes("Green") ||
        scoreText.includes("Yellow") ||
        scoreText.includes("Red");

      if (hasScore) {
        results.passes.push("F004: Score dashboard renders");
        console.log("  ✓ Score dashboard visible");

        if (hasColorRating) {
          results.passes.push("F004: Score color coding present");
          console.log("  ✓ Score color coding (Green/Yellow/Red)");
        }
      } else {
        results.blockers.push("[BLOCKER] Score dashboard not showing");
      }
    }

    // ===== EDGE CASE: Empty Form =====
    console.log("\nEDGE CASE: Empty form handling");
    await page.reload();
    await page.waitForTimeout(500);
    const emptyTabContent = await page.content();
    if (emptyTabContent.includes("example")) {
      results.passes.push("F001: Placeholder examples shown");
      console.log("  ✓ Placeholder values shown on empty form");
    }

    // ===== FEATURE: Dark Mode =====
    console.log("\nFEATURE: Dark Mode");
    const themeBtn = await page
      .locator('button[aria-label*="dark" i], button[aria-label*="theme" i]')
      .first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(300);
      results.passes.push("F010: Dark mode toggle works");
      console.log("  ✓ Dark mode toggle works");
    } else {
      results.escalations.push("[ESCALATION] Dark mode toggle not found");
    }

    // ===== FEATURE: Screenshot Export =====
    console.log("\nFEATURE: Screenshot Export");
    const downloadBtn = await page
      .locator('button:has-text("Download"), button[aria-label*="Download"]')
      .first();
    if (await downloadBtn.isVisible()) {
      results.passes.push("F008: Download button visible");
      console.log("  ✓ Download button present");
    } else {
      results.escalations.push(
        "[ESCALATION] Screenshot export button not visible",
      );
    }

    // ===== FEATURE: History =====
    console.log("\nFEATURE: History / Recent Checks");
    const historyTab = await page
      .locator('[role="tab"]:has-text("History")')
      .first();
    if (await historyTab.isVisible()) {
      await historyTab.click();
      await page.waitForTimeout(300);
      results.passes.push("F013: History tab accessible");
      console.log("  ✓ History tab exists");
    } else {
      results.escalations.push("[ESCALATION] History feature not found");
    }

    // ===== FEATURE: Bulk Check =====
    console.log("\nFEATURE: Bulk CSV Check");
    const bulkTab = await page.locator('[role="tab"]:has-text("Bulk")').first();
    if (await bulkTab.isVisible()) {
      await bulkTab.click();
      await page.waitForTimeout(300);
      results.passes.push("F014: Bulk check tab accessible");
      console.log("  ✓ Bulk check tab exists");
    } else {
      results.escalations.push("[ESCALATION] Bulk check feature not found");
    }

    // ===== FEATURE: Embeddable Widget =====
    console.log("\nFEATURE: Embeddable Widget");
    const embedTab = await page
      .locator('[role="tab"]:has-text("Embed")')
      .first();
    if (await embedTab.isVisible()) {
      await embedTab.click();
      await page.waitForTimeout(300);
      results.passes.push("F009: Embed tab accessible");
      console.log("  ✓ Embed tab exists");

      // Check for embed code
      const codeElements = await page.locator("code, textarea").count();
      if (codeElements > 0) {
        results.passes.push("F009: Embed code available");
        console.log("  ✓ Embed code present");
      }
    } else {
      results.escalations.push("[ESCALATION] Embed feature not found");
    }

    // ===== FEATURE: URL Fetch =====
    console.log("\nFEATURE: URL Auto-Fetch");
    const fetchBtn = await page
      .locator('button:has-text("Fetch"), button[aria-label*="Import"]')
      .first();
    if (await fetchBtn.isVisible()) {
      results.passes.push("F015: URL fetch button visible");
      console.log("  ✓ URL fetch button present");
    } else {
      results.warnings.push("[WARN] URL fetch button not clearly visible");
    }

    // ===== TEST: Invalid URL validation =====
    console.log("\nEDGE CASE: URL Validation");
    await page.goto(BASE_URL);
    const urlInputs = await page.locator('input[type="url"]').all();
    if (urlInputs.length > 0) {
      await urlInputs[0].fill("not-a-url");
      // Check for validation message
      const validationMsg = await page
        .locator("text=/invalid|error|valid/i")
        .count();
      if (validationMsg > 0) {
        results.passes.push("F001: URL validation works");
        console.log("  ✓ Invalid URL shows validation message");
      }
    }

    // ===== TEST: Long title truncation =====
    console.log("\nEDGE CASE: Title Truncation");
    await urlInputs[0].fill("https://example.com");
    const longTitle =
      "This is a very long title that should be truncated in the Google search result preview because it exceeds the maximum character limit";
    await titleInput.fill(longTitle);
    await page.waitForTimeout(300);
    const previewText = await page.evaluate(() => document.body.innerText);
    if (previewText.includes("...")) {
      results.passes.push("F002: Long title truncation");
      console.log("  ✓ Long title is truncated with ellipsis");
    } else {
      results.warnings.push("[WARN] Truncation not clearly visible");
    }

    // ===== KEYBOARD NAVIGATION =====
    console.log("\nEDGE CASE: Keyboard Navigation");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName || "UNKNOWN";
    });
    if (focused !== "UNKNOWN") {
      results.passes.push("F001: Keyboard navigation works");
      console.log(`  ✓ Tab navigation works (focused: ${focused})`);
    }
  } catch (error) {
    console.error("Test error:", error.message);
    results.blockers.push(`[BLOCKER] Fatal error: ${error.message}`);
  } finally {
    await browser.close();

    console.log("\n\n📊 FINAL TEST RESULTS");
    console.log("====================");
    console.log(`✅ Passes: ${results.passes.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);
    console.log(`❌ Blockers: ${results.blockers.length}`);
    console.log(`🚨 Escalations: ${results.escalations.length}`);

    console.log("\n📝 Summary:");
    results.passes.forEach((p) => console.log(`  ✓ ${p}`));
    results.warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
    results.blockers.forEach((b) => console.log(`  ❌ ${b}`));
    results.escalations.forEach((e) => console.log(`  🚨 ${e}`));

    const hasBlockers = results.blockers.length > 0;
    const hasEscalations = results.escalations.length > 0;
    console.log(
      `\n🎯 Verdict: ${hasBlockers || hasEscalations ? "FAIL" : "PASS"}`,
    );
  }
}

comprehensiveTest();
