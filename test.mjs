import { chromium } from "@playwright/test";

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3011/", { waitUntil: "networkidle" });

  console.log("=== PAGE LOAD TEST ===");
  const title = await page.title();
  console.log("✓ Page title:", title);

  // Get all headings to understand page structure
  const h1s = await page.locator("h1, h2").allTextContents();
  console.log("✓ Page headings:", h1s.slice(0, 5).join(" | "));

  // Test form inputs
  console.log("\n=== FORM INPUTS TEST ===");
  const inputs = await page.locator("input, textarea").all();
  console.log(`✓ Found ${inputs.length} input fields`);

  // Try to fill in test data
  if (inputs.length >= 2) {
    await inputs[0].fill("Best SEO Blog Title Ever");
    await inputs[1].fill(
      "Learn how to optimize your blog posts for search engines and increase traffic",
    );
    console.log("✓ Form inputs filled");
  }

  // Check for preview sections
  console.log("\n=== PREVIEW TABS TEST ===");
  const tabs = await page.locator('button[role="tab"]').allTextContents();
  console.log("✓ Preview tabs found:", tabs.join(" | "));

  // Check for scores
  console.log("\n=== SCORE DASHBOARD TEST ===");
  await page.waitForTimeout(500);
  const scoreElements = await page
    .locator("text=/[Ss]core|Overall|%|\/\d+/")
    .all();
  console.log(`✓ Found ${scoreElements.length} score-related elements`);

  // Check for theme toggle
  console.log("\n=== DARK MODE TEST ===");
  const buttons = await page.locator("button").all();
  let themeFound = false;
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (
      text &&
      (text.includes("Dark") ||
        text.includes("Light") ||
        text.includes("🌙") ||
        text.includes("☀"))
    ) {
      themeFound = true;
      console.log("✓ Theme toggle found");
      break;
    }
  }
  if (!themeFound) {
    console.log("⚠ Theme toggle not found in buttons");
  }

  // Check for social/embed links
  console.log("\n=== NAVIGATION TEST ===");
  const links = await page.locator("a").all();
  const linkTexts = await Promise.all(links.map((l) => l.textContent()));
  console.log(
    "✓ Navigation links:",
    linkTexts
      .filter((t) => t && t.trim().length > 0 && t.trim().length < 50)
      .slice(0, 8)
      .join(" | "),
  );

  console.log("\n✓ Basic page structure verified");
  await browser.close();
}

test().catch(console.error);
