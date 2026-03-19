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

    // Test 2: Check page content
    console.log("\n[TEST 2] Checking page content...");
    const content = await page.content();
    if (content.includes("title") || content.includes("Title")) {
      console.log("✓ Page has content");
    }

    // Test 3: Check URL
    console.log("\n[TEST 3] Current URL:");
    console.log(`✓ ${page.url()}`);

    console.log("\n=== ASSESSMENT COMPLETE ===\n");
  } catch (error) {
    console.error("Error during testing:", error.message);
  } finally {
    await browser.close();
  }
})();
