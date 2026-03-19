import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  console.log("\n=== TESTING SEO META PREVIEW & SCORER ===\n");

  try {
    // Test 1: Load the main page
    console.log("[TEST 1] Loading main page...");
    await page.goto("http://localhost:3009", { waitUntil: "networkidle" });
    const title = await page.title();
    console.log(`✓ Page loaded. Title: ${title}`);

    // Test 2: Check for input form
    console.log("\n[TEST 2] Checking for Meta Input Form...");
    const titleInput =
      (await page.$('input[placeholder*="e.g."]')) ||
      (await page.$('input[type="text"]'));
    if (titleInput) {
      console.log("✓ Found input field");
    } else {
      console.log("✗ No input field found");
    }

    // Test 3: Fill in the form
    console.log("\n[TEST 3] Filling in form with sample data...");
    await page.fill('input[placeholder*="title"]', "Best SEO Tips for 2024");
    console.log("✓ Entered title");

    const descInput = await page.$("textarea");
    if (descInput) {
      await page.fill(
        "textarea",
        "Learn the latest SEO best practices to rank higher in Google search results.",
      );
      console.log("✓ Entered description");
    }

    // Test 4: Check character counters
    console.log("\n[TEST 4] Checking character counters...");
    const counters = await page.$$("text=/[0-9]+ \/ [0-9]+/");
    console.log(`✓ Found ${counters.length} character counter(s)`);

    // Test 5: Look for preview tabs
    console.log("\n[TEST 5] Checking for preview tabs...");
    const tabs = await page.$$('[role="tab"]');
    console.log(
      `✓ Found ${tabs.length} preview tab(s): ${tabs.map((t) => t.textContent).join(", ")}`,
    );

    // Test 6: Check for Google Desktop preview
    console.log("\n[TEST 6] Checking for Google Desktop preview...");
    const previewText = await page.textContent("body");
    if (previewText.includes("google") || previewText.includes("Google")) {
      console.log("✓ Google preview likely present");
    }

    // Test 7: Look for score dashboard
    console.log("\n[TEST 7] Checking for SEO Score Dashboard...");
    const scoreText = await page.textContent("body");
    if (scoreText.includes("score") || scoreText.includes("Score")) {
      console.log("✓ Score dashboard likely present");
    }

    // Test 8: Check for dark mode toggle
    console.log("\n[TEST 8] Checking for dark mode toggle...");
    const darkModeBtn =
      (await page.$('button[title*="dark"]')) ||
      (await page.$('button[title*="theme"]')) ||
      (await page.$('[aria-label*="theme"]'));
    if (darkModeBtn) {
      console.log("✓ Dark mode toggle found");
      await darkModeBtn.click();
      console.log("✓ Clicked dark mode toggle");
    } else {
      console.log("⚠ Dark mode toggle not found");
    }

    // Test 9: Look for screenshot button
    console.log("\n[TEST 9] Checking for screenshot export...");
    const screenshotBtn =
      (await page.$('button:has-text("Screenshot")')) ||
      (await page.$("text=/screenshot|Download/i"));
    if (screenshotBtn) {
      console.log("✓ Screenshot button found");
    } else {
      console.log("⚠ Screenshot button not found");
    }

    // Test 10: Check for embed page
    console.log("\n[TEST 10] Checking embed functionality...");
    await page
      .goto("http://localhost:3009/embed", {
        waitUntil: "networkidle",
        timeout: 5000,
      })
      .catch(() => {
        console.log("⚠ /embed page not found");
      });

    // Test 11: Check for widget page
    console.log("\n[TEST 11] Checking widget page...");
    await page
      .goto("http://localhost:3009/widget", {
        waitUntil: "networkidle",
        timeout: 5000,
      })
      .catch(() => {
        console.log("⚠ /widget page not found");
      });

    console.log("\n=== INITIAL ASSESSMENT COMPLETE ===\n");
  } catch (error) {
    console.error("Error during testing:", error);
  } finally {
    await browser.close();
  }
})();
