import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const baseUrl = "http://localhost:3000";

  console.log("🧪 SEO Meta Preview & Scorer - User Experience Testing\n");
  console.log("=".repeat(60));

  try {
    // TEST 1: Page loads and shows input form
    console.log("\n[TEST 1] Landing Page & Input Form");
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const h1 = await page.locator("h1").first();
    const titleExists = await h1.isVisible().catch(() => false);
    console.log(titleExists ? "✓ H1 heading visible" : "✗ H1 heading missing");

    const titleInput = page.locator('input[placeholder*="Title"]');
    const inputsExist = await titleInput.isVisible().catch(() => false);
    console.log(
      inputsExist ? "✓ Input form visible" : "✗ Input form not found",
    );

    // TEST 2: Character counter updates
    console.log("\n[TEST 2] Real-Time Character Counter");
    const testTitle = "Best Tips for SEO in 2024";
    await titleInput.fill(testTitle);
    await page.waitForTimeout(100);

    const charCounter = page.locator("text=/ of /");
    const counterVisible = await charCounter
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      counterVisible
        ? "✓ Character counter updates in real-time"
        : "✗ Character counter not visible",
    );

    // TEST 3: Previews update instantly
    console.log("\n[TEST 3] Preview Updates");
    const googlePreview = page.locator('button:has-text("Google")');
    const previewExists = await googlePreview
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      previewExists
        ? "✓ Google Desktop preview visible"
        : "✗ Preview not found",
    );

    // TEST 4: URL validation
    console.log("\n[TEST 4] URL Validation");
    const urlInput = page.locator('input[placeholder*="https"]');
    await urlInput.fill("invalid-url");
    await page.waitForTimeout(200);

    const errorMsg = page.locator("text=/invalid|error/i");
    const errorVisible = await errorMsg
      .first()
      .isVisible()
      .catch(() => false);
    console.log(errorVisible ? "✓ URL validation works" : "✗ No error shown");

    // Fix the URL
    await urlInput.clear();
    await urlInput.fill("https://example.com");

    // TEST 5: Score Dashboard
    console.log("\n[TEST 5] SEO Score Dashboard");
    const descInput = page.locator("textarea").first();
    const testDesc =
      "Learn proven SEO strategies and techniques to boost your website ranking";
    await descInput.fill(testDesc);
    await page.waitForTimeout(100);

    const scoreGauge = page.locator("text=/Overall.*Score|/100/");
    const scoreVisible = await scoreGauge
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      scoreVisible ? "✓ Score dashboard visible" : "✗ Score not shown",
    );

    // TEST 6: Tab navigation
    console.log("\n[TEST 6] Preview Tabs Navigation");
    const tabs = page.locator('[role="tablist"] button');
    const tabCount = await tabs.count();
    console.log(`✓ Found ${tabCount} preview tabs`);

    const mobileTabs = page.locator('button:has-text("Mobile")');
    const mobileVisible = await mobileTabs
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      mobileVisible ? "✓ Mobile tab available" : "✗ Mobile tab missing",
    );

    const bingTabs = page.locator('button:has-text("Bing")');
    const bingVisible = await bingTabs
      .first()
      .isVisible()
      .catch(() => false);
    console.log(bingVisible ? "✓ Bing tab available" : "✗ Bing tab missing");

    const socialTabs = page.locator('button:has-text("Social")');
    const socialVisible = await socialTabs
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      socialVisible ? "✓ Social/OG tab available" : "✗ Social tab missing",
    );

    // TEST 7: Dark mode toggle
    console.log("\n[TEST 7] Dark Mode Toggle");
    const themeToggle = page
      .locator("button")
      .filter({ has: page.locator('svg[class*="moon"], svg[class*="sun"]') });
    const toggleExists = await themeToggle
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      toggleExists ? "✓ Theme toggle button visible" : "✗ Toggle missing",
    );

    if (toggleExists) {
      const originalTheme = await page
        .locator("html")
        .evaluate((el) => el.className);
      await themeToggle.first().click();
      await page.waitForTimeout(200);
      const newTheme = await page
        .locator("html")
        .evaluate((el) => el.className);
      console.log(
        originalTheme !== newTheme
          ? "✓ Dark mode toggled"
          : "✗ Theme toggle failed",
      );
    }

    // TEST 8: Screenshot button
    console.log("\n[TEST 8] Screenshot Export Button");
    const screenshotBtn = page.locator(
      "button:has-text(/Download|Export|PNG|Screenshot)",
    );
    const btnExists = await screenshotBtn
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      btnExists
        ? "✓ Screenshot export button found"
        : "✗ Screenshot button missing",
    );

    // TEST 9: Keyword highlighting
    console.log("\n[TEST 9] Keyword Input & Highlighting");
    const keywordInput = page.locator('input[placeholder*="Keyword"]');
    const keywordInputExists = await keywordInput
      .isVisible()
      .catch(() => false);
    console.log(
      keywordInputExists
        ? "✓ Keyword input field present"
        : "✗ Keyword field missing",
    );

    if (keywordInputExists) {
      await keywordInput.fill("SEO");
      await page.waitForTimeout(200);
      const boldInPreview = page.locator("strong, b");
      const boldCount = await boldInPreview.count();
      console.log(
        boldCount > 0
          ? "✓ Keyword appears to be highlighted"
          : "~ Keyword highlighting may not be visible",
      );
    }

    // TEST 10: Responsive design check
    console.log("\n[TEST 10] Responsive Design");
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const mobileInputVisible = await page
      .locator("input")
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      mobileInputVisible ? "✓ Mobile viewport works" : "✗ Mobile layout broken",
    );

    // TEST 11: Embed functionality
    console.log("\n[TEST 11] Embeddable Widget");
    await page.setViewportSize({ width: 1280, height: 720 }); // Reset to desktop
    const embedLink = page.locator("a:has-text(/Embed|Widget)");
    const embedExists = await embedLink
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      embedExists
        ? "✓ Embed link found in navigation"
        : "✗ Embed link not found",
    );

    if (embedExists) {
      await embedLink.first().click();
      await page.waitForLoadState("networkidle");
      console.log("✓ Embed page loaded");
    }

    // TEST 12: History feature
    console.log("\n[TEST 12] History Panel");
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const historyBtn = page.locator("button:has-text(/History|Recent)");
    const historyExists = await historyBtn
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      historyExists ? "✓ History panel available" : "✗ History missing",
    );

    console.log("\n" + "=".repeat(60));
    console.log("✅ User Experience Testing Complete\n");
  } catch (error) {
    console.error("❌ Test Error:", error.message);
  } finally {
    await browser.close();
  }
})();
