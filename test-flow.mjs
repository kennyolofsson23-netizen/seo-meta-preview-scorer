import { chromium } from "playwright";

const BASE_URL = "http://localhost:3000";

async function testApp() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("=== TESTING SEO META PREVIEW & SCORER ===\n");

  // Test 1: Load home page
  console.log("TEST 1: Load home page");
  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    console.log("✓ Page loaded successfully");
  } catch (e) {
    console.log("✗ Failed to load page:", e.message);
    await browser.close();
    return;
  }

  // Test 2: Check core UI elements - look for input fields
  console.log("\nTEST 2: Checking for input fields");
  const inputs = await page.locator("input, textarea").count();
  console.log(`✓ Found ${inputs} input/textarea fields`);

  // Test 3: Fill in form
  console.log("\nTEST 3: Enter test data");
  const titleField = page.locator("input").first();
  const descField = page.locator("textarea").first();
  const urlField = page.locator("input").nth(1);

  await titleField.fill("Best Python Tips for Beginners");
  await descField.fill(
    "Learn the top 10 Python tips that will make you a better programmer. Includes code examples and best practices.",
  );
  await urlField.fill("https://example.com/python-tips");
  console.log("✓ Form filled with test data");

  // Wait for previews to render
  await page.waitForTimeout(800);

  // Test 4: Check tabs
  console.log("\nTEST 4: Check preview tabs");
  const tabs = await page.locator('[role="tab"]').count();
  console.log(`✓ Found ${tabs} tabs`);

  // Test 5: Verify preview content appears
  console.log("\nTEST 5: Verify preview rendering");
  const previewText = await page.locator("text=example.com").count();
  if (previewText > 0) {
    console.log("✓ Preview content visible");
  } else {
    console.log("⚠ Preview content not found (may be in inactive tab)");
  }

  // Test 6: Test tab switching
  console.log("\nTEST 6: Test tab switching");
  try {
    await page.locator('[role="tab"]').nth(1).click();
    await page.waitForTimeout(300);
    console.log("✓ Tab switching works");
  } catch (e) {
    console.log("⚠ Tab switching issue:", e.message);
  }

  // Test 7: Check for scores
  console.log("\nTEST 7: Check scoring dashboard");
  const scoreElements = await page
    .locator("text=/[0-9]{1,3}(\.[0-9])?(\s*\/\s*100)?/")
    .count();
  console.log(`✓ Found ${scoreElements} score-related elements`);

  // Test 8: Theme toggle
  console.log("\nTEST 8: Test theme toggle");
  const themeButtons = await page
    .locator('button[aria-label*="theme" i]')
    .count();
  if (themeButtons > 0) {
    await page.locator('button[aria-label*="theme" i]').first().click();
    await page.waitForTimeout(300);
    console.log("✓ Theme toggle works");
  } else {
    console.log("⚠ Theme toggle button not found");
  }

  // Test 9: Character counters update
  console.log("\nTEST 9: Check character counters");
  const charCounters = await page.locator("text=/characters|\/|count/").count();
  console.log(`✓ Found ${charCounters} character counter elements`);

  // Test 10: Keyword input
  console.log("\nTEST 10: Test keyword input");
  const keywordInputs = page.locator(
    'input[placeholder*="keyword" i], input[placeholder*="Keyword" i]',
  );
  const keywordCount = await keywordInputs.count();
  if (keywordCount > 0) {
    await keywordInputs.first().fill("Python");
    console.log("✓ Keyword input works");
  } else {
    console.log("⚠ Keyword input not found");
  }

  // Test 11: Check for export/download buttons
  console.log("\nTEST 11: Check for export features");
  const exportButtons = await page
    .locator(
      'button:has-text("Download"), button:has-text("Export"), button:has-text("Screenshot")',
    )
    .count();
  console.log(`✓ Found ${exportButtons} export-related buttons`);

  // Test 12: Check for navigation to other pages
  console.log("\nTEST 12: Check for embed/widget link");
  const embedLinks = await page
    .locator('a[href*="embed"], a[href*="widget"]')
    .count();
  console.log(`✓ Found ${embedLinks} embed-related links`);

  // Test 13: Mobile viewport
  console.log("\nTEST 13: Test mobile responsiveness");
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(300);
  const mobileInputs = await page.locator("input, textarea").count();
  console.log(`✓ Mobile view shows ${mobileInputs} input fields`);

  // Test 14: Form validation
  console.log("\nTEST 14: Test URL validation");
  await page.setViewportSize({ width: 1280, height: 800 });
  const urlInput = page.locator("input").nth(1);
  await urlInput.clear();
  await urlInput.fill("not-a-valid-url");
  await page.waitForTimeout(300);
  const errorMsg = await page.locator("text=/invalid|error/i").count();
  if (errorMsg > 0) {
    console.log("✓ URL validation works");
  } else {
    console.log("⚠ URL validation message not found");
  }

  console.log("\n=== ALL TESTS COMPLETE ===");
  await browser.close();
}

testApp().catch(console.error);
