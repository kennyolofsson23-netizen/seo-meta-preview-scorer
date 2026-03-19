import { chromium } from "@playwright/test";

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate and wait for full page load
  await page.goto("http://localhost:3011/", { waitUntil: "domcontentloaded" });

  // Wait for React to hydrate and render content
  await page.waitForTimeout(2000);

  console.log("\n=== ACTUAL PAGE CONTENT ===\n");

  // Get page content
  const content = await page.content();

  // Check for specific text patterns
  if (content.includes("Title")) {
    console.log("✓ Title field found in HTML");
  }
  if (content.includes("Description")) {
    console.log("✓ Description field found in HTML");
  }
  if (content.includes("Google")) {
    console.log("✓ Google preview mentioned");
  }
  if (content.includes("Bing")) {
    console.log("✓ Bing preview mentioned");
  }
  if (content.includes("Social")) {
    console.log("✓ Social preview mentioned");
  }
  if (content.includes("Score") || content.includes("score")) {
    console.log("✓ Scoring mentioned");
  }

  // Look at actual rendered text
  const allText = await page.innerText("body");

  if (allText.includes("Title") || allText.includes("title")) {
    console.log("✓ Title field visible on page");
  } else {
    console.log("⚠ Title field not found");
  }

  // Try interacting with inputs
  console.log("\n=== INTERACTION TEST ===\n");

  // Find inputs by various selectors
  let inputFound = false;

  // Try to find and fill input
  try {
    const inputs = await page.locator('input[type="text"], textarea').all();
    if (inputs.length > 0) {
      inputFound = true;
      console.log(`✓ Found ${inputs.length} interactive input fields`);

      // Try to fill first input
      await inputs[0].fill("Test Title for SEO");
      console.log("✓ Successfully filled first input");
    }
  } catch (e) {
    console.log("⚠ Could not find/fill inputs");
  }

  if (!inputFound) {
    // Try to find divs that are contenteditable or have input-like behavior
    const editables = await page.locator('[contenteditable="true"]').all();
    if (editables.length > 0) {
      console.log(`✓ Found ${editables.length} contenteditable elements`);
    } else {
      console.log(
        "⚠ No input elements found. Page structure may not be rendering.",
      );
    }
  }

  // Check the page state
  console.log("\n=== PAGE STATE ===\n");
  const bodyText = allText.slice(0, 500);
  console.log("First 500 chars of page:\n" + bodyText);

  await browser.close();
}

test().catch(console.error);
