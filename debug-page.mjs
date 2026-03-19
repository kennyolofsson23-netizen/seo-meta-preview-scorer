import { chromium } from "@playwright/test";

async function debug() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3011/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  console.log("\n=== PAGE STRUCTURE DEBUG ===\n");

  // Get page content
  const html = await page.content();

  // Check for key elements
  const checks = [
    ["Meta Preview", "Meta Preview" in html],
    ["Title in content", "title" in html.toLowerCase()],
    ["Input elements", "<input" in html],
    ["Textarea elements", "<textarea" in html],
    ["Tab elements", 'role="tab"' in html],
    ["Google text", "Google" in html],
    ["Bing text", "Bing" in html],
    ["Score text", "Score" in html || "score" in html.toLowerCase()],
    ["Dark theme script", "localStorage.getItem" in html],
    [
      "Download button",
      "download" in html.toLowerCase() || "screenshot" in html.toLowerCase(),
    ],
  ];

  checks.forEach(([label, result]) => {
    console.log(`${result ? "✓" : "✗"} ${label}`);
  });

  // List all button texts
  console.log("\n--- Button Texts ---");
  const buttons = await page.locator("button").all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.trim().length > 0 && text.trim().length < 100) {
      console.log(`  • ${text.trim()}`);
    }
  }

  // List all visible text content (first 2000 chars)
  console.log("\n--- First 1500 chars of visible text ---");
  const text = await page.innerText("body");
  console.log(text.slice(0, 1500));

  // Check HTML structure
  console.log("\n--- HTML Structure Check ---");
  const hasInputs = html.includes("<input");
  const hasTextarea = html.includes("<textarea");
  const hasTabs = html.includes('role="tab"');

  console.log(`Has <input>: ${hasInputs}`);
  console.log(`Has <textarea>: ${hasTextarea}`);
  console.log(`Has tabs: ${hasTabs}`);

  // Count different element types
  const inputCount = (html.match(/<input/g) || []).length;
  const buttonCount = (html.match(/<button/g) || []).length;
  const linkCount = (html.match(/<a\s/g) || []).length;

  console.log(`\nTotal inputs: ${inputCount}`);
  console.log(`Total buttons: ${buttonCount}`);
  console.log(`Total links: ${linkCount}`);

  await browser.close();
}

debug().catch(console.error);
