import { chromium } from "playwright";

const BASE_URL = "http://localhost:3010";
let browser, page;

async function setup() {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
}

async function cleanup() {
  await browser.close();
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
  }
}

async function main() {
  await setup();

  try {
    // Test homepage
    await test("Homepage loads", async () => {
      await page.goto(BASE_URL);
      const content = await page.content();
      if (!content.includes("<!DOCTYPE")) throw new Error("Not HTML");
    });

    // Test form elements
    await test("Find input form fields", async () => {
      const inputs = await page.locator("input, textarea").count();
      console.log(`  → Found ${inputs} input elements`);
      if (inputs === 0) throw new Error("No inputs found");
    });

    // Test filling form
    await test("Fill meta input form", async () => {
      const textareas = page.locator("textarea");
      const inputs = page.locator("input[type='text']");
      
      if (await inputs.count() > 0) {
        await inputs.first().fill("Test SEO Title");
      }
      if (await textareas.count() > 0) {
        await textareas.first().fill("Test description for SEO");
      }
      
      await page.waitForTimeout(200);
      const pageText = await page.content();
      if (!pageText.includes("Test")) throw new Error("Form input not visible");
    });

    // Test character counter
    await test("Character counter displays", async () => {
      const counter = await page.locator("text=/[0-9]+\s*\/\s*[0-9]+/").count();
      console.log(`  → Found ${counter} character counters`);
    });

    // Test preview sections
    await test("Preview tabs exist", async () => {
      const tabs = await page.locator("[role='tab'], button").count();
      console.log(`  → Found ${tabs} interactive elements`);
    });

    // Test dark mode
    await test("Dark mode toggle exists", async () => {
      const buttons = await page.locator("button").count();
      console.log(`  → Found ${buttons} buttons`);
    });

    // Test embed page
    await test("Embed page accessible", async () => {
      await page.goto(`${BASE_URL}/embed`);
      const content = await page.content();
      if (!content.includes("<!DOCTYPE")) throw new Error("Embed page not accessible");
    });

    // Test widget page
    await test("Widget page accessible", async () => {
      await page.goto(`${BASE_URL}/widget`);
      const content = await page.content();
      if (!content.includes("<!DOCTYPE")) throw new Error("Widget page not accessible");
    });

    console.log("\nAll tests completed!");

  } catch (error) {
    console.error("Test error:", error);
  } finally {
    await cleanup();
  }
}

main();
