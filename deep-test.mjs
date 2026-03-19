import { chromium } from "playwright";
import fs from "fs";

const BASE_URL = "http://localhost:3011";

async function runDeepTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Go to main page
    console.log("Loading main page...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // Save HTML for inspection
    const html = await page.content();
    fs.writeFileSync("page-structure.html", html);

    // Test URL field
    console.log("\n=== Testing URL Field ===");
    const allInputs = await page.locator("input").all();
    console.log(`Total inputs: ${allInputs.length}`);

    for (let i = 0; i < allInputs.length; i++) {
      const type = await allInputs[i].getAttribute("type");
      const placeholder = await allInputs[i].getAttribute("placeholder");
      const name = await allInputs[i].getAttribute("name");
      const id = await allInputs[i].getAttribute("id");
      console.log(
        `Input ${i}: type=${type}, placeholder=${placeholder}, name=${name}, id=${id}`,
      );
    }

    // Test Download buttons
    console.log("\n=== Testing Download/Export Buttons ===");
    const allButtons = await page.locator("button").all();
    console.log(`Total buttons: ${allButtons.length}`);

    for (let i = 0; i < Math.min(15, allButtons.length); i++) {
      const text = await allButtons[i].textContent();
      const ariaLabel = await allButtons[i].getAttribute("aria-label");
      const title = await allButtons[i].getAttribute("title");
      const className = await allButtons[i].getAttribute("class");
      console.log(
        `Button ${i}: text="${text?.trim()}", aria-label="${ariaLabel}", title="${title}"`,
      );
    }

    // Check for screenshot/download functionality
    console.log("\n=== Checking Screenshot Export Feature ===");
    const screenshotButtons = await page
      .locator(
        'button:has-text("Screenshot"), button:has-text("Download"), button:has-text("Export")',
      )
      .count();
    console.log(`Screenshot-related buttons: ${screenshotButtons}`);

    // Check embed page
    console.log("\n=== Testing Embed Page ===");
    const embedResponse = await page
      .goto(`${BASE_URL}/embed`, { waitUntil: "networkidle" })
      .catch((e) => null);
    if (embedResponse && embedResponse.status() < 400) {
      console.log(`Embed page status: ${embedResponse.status()}`);
      const embedHtml = await page.content();
      fs.writeFileSync("embed-page.html", embedHtml);
      console.log("Embed page loaded successfully");

      // Check for embed code
      const embedCodeArea = await page
        .locator('code, textarea, pre, [class*="code"]')
        .count();
      console.log(`Code/textarea elements: ${embedCodeArea}`);
    } else {
      console.log("Embed page failed to load");
    }

    // Go back to main
    await page.goto(BASE_URL);

    // Test preview tabs and score calculation
    console.log("\n=== Testing Preview Tabs ===");
    const tabs = await page.locator('[role="tab"]').all();
    console.log(`Total tabs: ${tabs.length}`);
    for (let i = 0; i < tabs.length; i++) {
      const text = await tabs[i].textContent();
      console.log(`Tab ${i}: "${text?.trim()}"`);
    }

    // Fill in sample data
    console.log("\n=== Testing Data Entry ===");
    const titleInput = allInputs[0];
    const descTextarea = await page.locator("textarea").first();

    await titleInput.fill("The Best Coffee Shop in Brooklyn - 2024 Guide");
    await descTextarea.fill(
      "Discover the top 10 coffee shops in Brooklyn with reviews, ratings, and insider tips for the best espresso and pastries.",
    );

    if (allInputs.length > 2) {
      await allInputs[2].fill("https://example.com/best-coffee-shops-brooklyn");
      console.log("Filled URL field");
    }

    if (allInputs.length > 1) {
      await allInputs[1].fill("coffee shops brooklyn");
      console.log("Filled keyword field");
    }

    // Wait for rendering
    await page.waitForTimeout(1000);

    // Check if scores updated
    console.log("\n=== Checking Score Output ===");
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasScore = pageText.includes("score") || pageText.includes("Score");
    console.log(`Has score feedback: ${hasScore}`);

    // Find preview content
    console.log("\n=== Checking Preview Content ===");
    const previewArea = await page.locator("text=/brooklyn|coffee/i").count();
    console.log(`Preview shows entered content: ${previewArea > 0}`);

    // Check keyboard navigation
    console.log("\n=== Testing Keyboard Navigation ===");
    await page.keyboard.press("Tab");
    const focused1 = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`After Tab: Focused element = ${focused1}`);

    await page.keyboard.press("Tab");
    const focused2 = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`After Tab: Focused element = ${focused2}`);

    // Check for any errors in console
    console.log("\n=== Console Messages ===");
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    await page.waitForTimeout(500);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await browser.close();
  }
}

runDeepTest();
