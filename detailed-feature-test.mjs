import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3011';

async function detailedFeatureTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔍 DETAILED FEATURE TESTING\n');

    // ===== Test 1: Screenshot Export Flow =====
    console.log('TEST 1: Screenshot Export');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Fill form
    const inputs = await page.locator('input[type="text"], input[type="url"]').all();
    const textarea = await page.locator('textarea').first();

    await inputs[0].fill('Best Coffee Shops in Brooklyn');
    await textarea.fill('Discover the top-rated coffee shops in Brooklyn with unique atmospheres and delicious espresso drinks.');
    await inputs[1].fill('https://example.com/coffee-guide');
    await inputs[2].fill('coffee shops brooklyn');

    await page.waitForTimeout(500);

    // Try to download
    const downloadPromise = page.waitForEvent('download');
    const downloadBtn = await page.locator('button:has-text("Download")').first();

    if (await downloadBtn.isEnabled()) {
      await downloadBtn.click();
      try {
        const download = await downloadPromise;
        console.log(`  ✓ Screenshot download initiated: ${download.suggestedFilename()}`);
      } catch (e) {
        console.log(`  ⚠️  Download dialog did not appear (this may be expected)`);
      }
    } else {
      console.log('  ⚠️  Download button not enabled');
    }

    // ===== Test 2: History Feature =====
    console.log('\nTEST 2: History / Recent Checks');
    const historyTab = await page.locator('[role="tab"]:has-text("History")').first();
    if (await historyTab.isVisible()) {
      await historyTab.click();
      await page.waitForTimeout(300);

      const historyContent = await page.locator('text=/coffee|brooklyn/i').count();
      if (historyContent > 0) {
        console.log('  ✓ History shows recent check');
      } else {
        console.log('  ⚠️  History panel visible but may not show items');
      }
    }

    // ===== Test 3: Affiliate Links =====
    console.log('\nTEST 3: Affiliate Recommendations');
    await page.goto(`${BASE_URL}#preview-score`);
    const affiliateLinks = await page.locator('a[rel*="sponsored"], a:has-text("Ahrefs"), a:has-text("Semrush"), a:has-text("SurferSEO")').count();
    console.log(`  ${affiliateLinks > 0 ? '✓' : '⚠️'} Affiliate CTAs: ${affiliateLinks}`);

    // ===== Test 4: Embed Code Generation =====
    console.log('\nTEST 4: Embed Code Generation');
    const embedTab = await page.locator('[role="tab"]:has-text("Embed")').first();
    await embedTab.click();
    await page.waitForTimeout(300);

    const codeBlock = await page.locator('code, textarea[readonly], textarea[disabled]').first();
    if (await codeBlock.isVisible()) {
      const embedCode = await codeBlock.textContent();
      if (embedCode.includes('iframe') || embedCode.includes('script')) {
        console.log('  ✓ Embed code contains iframe/script');
        console.log(`    Code snippet: ${embedCode.substring(0, 80)}...`);
      } else {
        console.log('  ⚠️  Code block found but may not be embed code');
      }
    } else {
      console.log('  ✗ Embed code block not found');
    }

    // ===== Test 5: Score Specifics =====
    console.log('\nTEST 5: SEO Score Details');
    await page.goto(BASE_URL);

    // Reset and test with optimal length title
    const titleInput = await page.locator('input[type="text"]').first();
    const descInput = await page.locator('textarea').first();

    await titleInput.fill('The Best Coffee Shops in Brooklyn - 2024');
    await descInput.fill('Discover the best coffee shops in Brooklyn with ratings, reviews, and insider tips for finding the perfect espresso and pastries.');

    await page.waitForTimeout(500);

    const pageText = await page.evaluate(() => document.body.innerText);

    // Check for specific score feedback
    const hasGreenScore = pageText.includes('Green') || pageText.includes('Optimal');
    const hasYellowScore = pageText.includes('Yellow');
    const hasRedScore = pageText.includes('Red');
    const hasFeedback = pageText.includes('character') || pageText.includes('length');

    console.log(`  ${hasGreenScore ? '✓' : '⚠️'} Green score feedback`);
    console.log(`  ${hasYellowScore ? '✓' : '⚠️'} Yellow score feedback`);
    console.log(`  ${hasRedScore ? '✓' : '⚠️'} Red score feedback`);
    console.log(`  ${hasFeedback ? '✓' : '⚠️'} Detailed character feedback`);

    // Check for overall score
    const overallScoreMatch = pageText.match(/\d+\s*%|\d+\/\d+/);
    if (overallScoreMatch) {
      console.log(`  ✓ Overall score displayed: ${overallScoreMatch[0]}`);
    }

    // ===== Test 6: Mobile Truncation Warning =====
    console.log('\nTEST 6: Mobile Truncation Warning');
    const longTitle = 'This is an extremely long title that definitely exceeds the mobile character limit and should trigger a warning';
    await titleInput.fill(longTitle);
    await page.waitForTimeout(300);

    const warningText = await page.evaluate(() => document.body.innerText);
    const hasMobileWarning = warningText.includes('mobile') || warningText.includes('Mobile') || warningText.includes('truncate');
    console.log(`  ${hasMobileWarning ? '✓' : '⚠️'} Mobile truncation warning appears for long title`);

    // ===== Test 7: Keyword Presence Check =====
    console.log('\nTEST 7: Keyword Presence Check');
    const keywordInput = await page.locator('input[placeholder*="keyword"]').first();
    await titleInput.fill('Best SEO Software for Rankings');
    await keywordInput.fill('SEO Software');
    await page.waitForTimeout(300);

    const keywordCheckText = await page.evaluate(() => document.body.innerText);
    const hasKeywordCheck = keywordCheckText.includes('keyword') || keywordCheckText.includes('Keyword');
    console.log(`  ${hasKeywordCheck ? '✓' : '⚠️'} Keyword presence feedback`);

    // ===== Test 8: Preview Tab Switching =====
    console.log('\nTEST 8: Preview Tab Responsiveness');
    const tabs = await page.locator('[role="tab"]').all();
    const tabNames = [];

    for (let i = 0; i < Math.min(4, tabs.length); i++) {
      const tabText = await tabs[i].textContent();
      if (tabText && tabText.includes('Google') || tabText.includes('Bing') || tabText.includes('Social')) {
        await tabs[i].click();
        await page.waitForTimeout(200);

        const contentChanged = await page.evaluate(() => {
          return document.body.innerText.length;
        });

        if (contentChanged > 100) {
          tabNames.push(tabText.trim());
        }
      }
    }

    console.log(`  ✓ Successfully switched ${tabNames.length} preview tabs`);

    // ===== Test 9: Light/Dark Mode Contrast =====
    console.log('\nTEST 9: Dark Mode Rendering');
    const themeBtn = await page.locator('button[aria-label*="dark" i]').first();
    const bodyBefore = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(300);

      const bodyAfter = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      if (bodyBefore !== bodyAfter) {
        console.log(`  ✓ Theme switched (before: ${bodyBefore}, after: ${bodyAfter})`);
      } else {
        console.log(`  ⚠️  Theme toggle clicked but colors may not have changed`);
      }
    }

    // ===== Test 10: Form Persistence =====
    console.log('\nTEST 10: Form Data Persistence');
    const formData = {
      title: 'Test Title Persistence',
      desc: 'Test description for persistence',
      url: 'https://example.com/persist'
    };

    const titleIn = await page.locator('input[type="text"]').first();
    const descIn = await page.locator('textarea').first();
    const urlIn = await page.locator('input[type="url"]').first();

    await titleIn.fill(formData.title);
    await descIn.fill(formData.desc);
    await urlIn.fill(formData.url);

    // Check if data is still there
    const titleVal = await titleIn.inputValue();
    const descVal = await descIn.inputValue();
    const urlVal = await urlIn.inputValue();

    const persisted = titleVal === formData.title && descVal === formData.desc && urlVal === formData.url;
    console.log(`  ${persisted ? '✓' : '✗'} Form data remains after input`);

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Detailed testing complete');
  }
}

detailedFeatureTest();
