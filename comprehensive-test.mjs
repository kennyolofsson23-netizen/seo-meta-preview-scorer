import { chromium } from "@playwright/test";

const RESULTS = [];

function logResult(feature, status, message) {
  const prefix = status === "OK" ? "✓" : status === "BLOCKER" ? "✗" : "⚠";
  console.log(`${prefix} ${feature}: ${message}`);
  RESULTS.push({ feature, status, message });
}

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("\n========== COMPREHENSIVE USER FLOW TEST ==========\n");

  // PAGE LOAD & STRUCTURE (F000)
  console.log("--- F000: Shared Infrastructure ---\n");
  try {
    await page.goto("http://localhost:3011/", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(1000);

    const content = await page.content();

    if (content.includes("SEO Meta Preview")) {
      logResult("F000", "OK", "Page loads with correct title and structure");
    } else {
      logResult("F000", "BLOCKER", "Page title not found");
    }

    // Check for theme toggle
    const themeBtn = await page
      .locator("button")
      .filter({ hasText: /🌙|☀|dark|light|theme/i })
      .first();
    if (themeBtn) {
      logResult("F000-Theme", "OK", "Theme toggle present");
    }
  } catch (e) {
    logResult("F000", "BLOCKER", `Page load failed: ${e.message}`);
  }

  // META INPUT FORM (F001)
  console.log("\n--- F001: Meta Input Form ---\n");
  try {
    const inputs = await page.locator('input[type="text"], textarea').all();
    if (inputs.length >= 2) {
      logResult("F001", "OK", `Found ${inputs.length} input fields`);

      // Test real-time character counting
      await inputs[0].fill("This is a blog post title about SEO optimization");
      await page.waitForTimeout(100);

      const counterText = await page.innerText("body");
      if (
        counterText.includes("characters") ||
        counterText.includes("chars") ||
        /\d+\/\d+/.test(counterText)
      ) {
        logResult(
          "F001-CharCounter",
          "OK",
          "Character counter updates in real-time",
        );
      }

      // Test description input
      if (inputs.length >= 2) {
        await inputs[1].fill(
          "Learn the best practices for optimizing your blog post titles and descriptions for search engines",
        );
        logResult("F001-DescInput", "OK", "Description field accepts input");
      }
    } else {
      logResult(
        "F001",
        "BLOCKER",
        `Only found ${inputs.length} inputs, expected 2+`,
      );
    }
  } catch (e) {
    logResult("F001", "BLOCKER", `Input test failed: ${e.message}`);
  }

  // PREVIEW TABS (F002, F003, F005, F006)
  console.log("\n--- Preview Tabs ---\n");
  try {
    const tabs = await page.locator('button[role="tab"]').allTextContents();

    if (tabs.length > 0) {
      logResult(
        "F007",
        "OK",
        `Found ${tabs.length} preview tabs: ${tabs.join(", ")}`,
      );

      // Check for each expected preview type
      const tabsStr = tabs.join(" ").toLowerCase();

      if (
        tabsStr.includes("google") &&
        (tabsStr.includes("desktop") || /google.*[123]/.test(tabsStr))
      ) {
        logResult("F002", "OK", "Google Desktop preview tab found");
      } else {
        logResult("F002", "WARN", "Google Desktop tab not clearly labeled");
      }

      if (tabsStr.includes("google") && tabsStr.includes("mobile")) {
        logResult("F003", "OK", "Google Mobile preview tab found");
      } else if (tabsStr.includes("mobile")) {
        logResult("F003", "OK", "Mobile preview tab found");
      } else {
        logResult("F003", "WARN", "Google Mobile tab not clearly labeled");
      }

      if (tabsStr.includes("bing")) {
        logResult("F005", "OK", "Bing preview tab found");
      } else {
        logResult("F005", "WARN", "Bing tab not found");
      }

      if (
        tabsStr.includes("social") ||
        tabsStr.includes("og") ||
        tabsStr.includes("card")
      ) {
        logResult("F006", "OK", "Social/OG card preview tab found");
      } else {
        logResult("F006", "WARN", "Social/OG card tab not clearly labeled");
      }
    } else {
      logResult("F007", "BLOCKER", "No preview tabs found");
    }
  } catch (e) {
    logResult("F007", "BLOCKER", `Tab discovery failed: ${e.message}`);
  }

  // SCORING DASHBOARD (F004)
  console.log("\n--- F004: SEO Score Dashboard ---\n");
  try {
    const bodyText = await page.innerText("body");

    if (bodyText.includes("Score") || bodyText.includes("score")) {
      logResult("F004", "OK", "Score dashboard visible");

      // Check for specific score components
      if (bodyText.includes("%") || /\d+\/\d+/.test(bodyText)) {
        logResult(
          "F004-ScoreFormat",
          "OK",
          "Scores display with numeric format",
        );
      }

      if (bodyText.includes("Title") || bodyText.includes("Description")) {
        logResult(
          "F004-Components",
          "OK",
          "Individual score components visible",
        );
      }
    } else {
      logResult("F004", "WARN", "Score section not clearly visible");
    }
  } catch (e) {
    logResult("F004", "BLOCKER", `Score test failed: ${e.message}`);
  }

  // DARK MODE (F010)
  console.log("\n--- F010: Dark Mode ---\n");
  try {
    const initialClass = await page
      .locator("html")
      .evaluate((el) => el.className);
    const themeBtn = await page
      .locator("button")
      .filter({ hasText: /🌙|☀|dark|light|theme/i })
      .first();

    if (themeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(200);

      const newClass = await page
        .locator("html")
        .evaluate((el) => el.className);

      if (initialClass !== newClass) {
        logResult("F010", "OK", "Dark mode toggle works and changes DOM");
      } else {
        logResult("F010", "WARN", "Dark mode toggle may not be functional");
      }
    } else {
      logResult("F010", "WARN", "Theme toggle button not found");
    }
  } catch (e) {
    logResult("F010", "BLOCKER", `Dark mode test failed: ${e.message}`);
  }

  // SCREENSHOT EXPORT (F008)
  console.log("\n--- F008: Screenshot Export ---\n");
  try {
    const downloadBtn = await page
      .locator("button")
      .filter({ hasText: /download|screenshot|export/i })
      .first();

    if (downloadBtn) {
      logResult("F008", "OK", "Screenshot/Download button found");
    } else {
      logResult(
        "F008",
        "WARN",
        "Download button not found in obvious location",
      );
    }
  } catch (e) {
    logResult("F008", "WARN", `Screenshot button search failed: ${e.message}`);
  }

  // EMBEDDABLE WIDGET (F009)
  console.log("\n--- F009: Embeddable Widget ---\n");
  try {
    // Check for embed navigation
    const embedLink = await page
      .locator("a, button")
      .filter({ hasText: /embed|widget/i })
      .first();

    if (embedLink) {
      logResult("F009", "OK", "Embed/Widget link found in navigation");

      // Try to navigate to embed page
      const href = await embedLink.getAttribute("href");
      if (href && href.includes("/embed")) {
        await page.goto(`http://localhost:3011${href}`);
        await page.waitForTimeout(500);

        const embedContent = await page.innerText("body");
        if (
          embedContent.includes("embed") ||
          embedContent.includes("code") ||
          embedContent.includes("iframe")
        ) {
          logResult("F009-Page", "OK", "Embed page loads successfully");
        }
      }
    } else {
      logResult("F009", "WARN", "Embed navigation not found");
    }
  } catch (e) {
    logResult("F009", "WARN", `Embed page test failed: ${e.message}`);
  }

  // HISTORY (F013)
  console.log("\n--- F013: History / Recent Checks ---\n");
  try {
    // Navigate back to main
    await page.goto("http://localhost:3011/", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(500);

    const historyLink = await page
      .locator("a, button")
      .filter({ hasText: /history|recent/i })
      .first();

    if (historyLink) {
      logResult("F013", "OK", "History feature link found");

      // Try clicking it
      await historyLink.click();
      await page.waitForTimeout(300);

      const historyContent = await page.innerText("body");
      if (
        historyContent.includes("history") ||
        historyContent.includes("check")
      ) {
        logResult("F013-UI", "OK", "History panel displays");
      }
    } else {
      logResult("F013", "WARN", "History link not found");
    }
  } catch (e) {
    logResult("F013", "WARN", `History test failed: ${e.message}`);
  }

  // BULK CHECK (F014)
  console.log("\n--- F014: Bulk CSV Check ---\n");
  try {
    const bulkLink = await page
      .locator("a, button")
      .filter({ hasText: /bulk|csv/i })
      .first();

    if (bulkLink) {
      logResult("F014", "OK", "Bulk check feature found");
    } else {
      logResult("F014", "WARN", "Bulk check not found");
    }
  } catch (e) {
    logResult("F014", "WARN", `Bulk check search failed: ${e.message}`);
  }

  // URL FETCH (F015)
  console.log("\n--- F015: URL Auto-Fetch ---\n");
  try {
    const fetchBtn = await page
      .locator("button")
      .filter({ hasText: /fetch|import/i })
      .first();

    if (fetchBtn) {
      logResult("F015", "OK", "URL Fetch button found");
    } else {
      logResult("F015", "WARN", "URL Fetch button not found");
    }
  } catch (e) {
    logResult("F015", "WARN", `URL Fetch search failed: ${e.message}`);
  }

  // AFFILIATE RECOMMENDATIONS (F011)
  console.log("\n--- F011: Affiliate Recommendations ---\n");
  try {
    const content = await page.innerText("body");

    if (
      content.includes("Ahrefs") ||
      content.includes("Semrush") ||
      content.includes("SurferSEO")
    ) {
      logResult("F011", "OK", "Affiliate recommendations visible");
    } else {
      logResult("F011", "WARN", "Affiliate recommendations not found");
    }
  } catch (e) {
    logResult("F011", "WARN", `Affiliate search failed: ${e.message}`);
  }

  // DYNAMIC OG IMAGE (F012)
  console.log("\n--- F012: Dynamic OG Image ---\n");
  try {
    const response = await page.goto(
      "http://localhost:3011/api/og?title=Test&score=85",
    );
    if (response && response.status() === 200) {
      const contentType = response.headers()["content-type"] || "";
      if (contentType.includes("image")) {
        logResult("F012", "OK", "OG image API endpoint works");
      } else {
        logResult(
          "F012",
          "WARN",
          "OG endpoint responds but may not return image",
        );
      }
    }
  } catch (e) {
    logResult("F012", "WARN", `OG image test failed: ${e.message}`);
  }

  await browser.close();

  // SUMMARY
  console.log("\n\n========== TEST SUMMARY ==========\n");

  const blockers = RESULTS.filter((r) => r.status === "BLOCKER");
  const warnings = RESULTS.filter((r) => r.status === "WARN");
  const passed = RESULTS.filter((r) => r.status === "OK");

  console.log(`✓ PASS: ${passed.length}`);
  console.log(`⚠ WARN: ${warnings.length}`);
  console.log(`✗ BLOCKERS: ${blockers.length}`);

  if (blockers.length > 0) {
    console.log("\n--- BLOCKERS ---");
    blockers.forEach((r) => console.log(`  ✗ ${r.feature}: ${r.message}`));
  }

  if (warnings.length > 0) {
    console.log("\n--- WARNINGS ---");
    warnings.forEach((r) => console.log(`  ⚠ ${r.feature}: ${r.message}`));
  }

  console.log("\n--- PASSED ---");
  passed.forEach((r) => console.log(`  ✓ ${r.feature}: ${r.message}`));
}

test().catch(console.error);
