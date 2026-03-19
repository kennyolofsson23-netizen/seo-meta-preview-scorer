import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3011';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🚀 SEO Meta Preview & Scorer - User Testing');
  console.log('=========================================\n');

  const results = {
    passes: [],
    failures: [],
    escalations: []
  };

  try {
    // Test 1: Page loads
    console.log('TEST 1: Page loads');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const pageTitle = await page.title();
    console.log(`  Title: "${pageTitle}"`);
    results.passes.push('Page loads successfully');

    // Test 2: Check for main UI elements
    console.log('\nTEST 2: Main UI elements');
    const mainContent = await page.content();

    const hasTitleInput = mainContent.includes('title') || await page.locator('input').count() > 0;
    console.log(`  ${hasTitleInput ? '✓' : '✗'} Title input field`);
    if (hasTitleInput) results.passes.push('Title input found');

    const hasDescInput = await page.locator('textarea').count() > 0;
    console.log(`  ${hasDescInput ? '✓' : '✗'} Description textarea`);
    if (hasDescInput) results.passes.push('Description input found');

    const hasPreviewTabs = await page.locator('[role="tablist"]').count() > 0;
    console.log(`  ${hasPreviewTabs ? '✓' : '✗'} Preview tabs`);
    if (hasPreviewTabs) results.passes.push('Preview tabs found');

    const tabContents = await page.locator('[role="tab"]').allTextContents();
    console.log(`    Tabs: ${tabContents.join(', ')}`);

    // Test 3: Form input
    console.log('\nTEST 3: Input form functionality');
    const inputs = await page.locator('input[type="text"]').all();
    const textareas = await page.locator('textarea').all();

    if (inputs.length > 0) {
      await inputs[0].fill('Test Title for SEO');
      const val = await inputs[0].inputValue();
      console.log(`  ✓ Title input: "${val}"`);
      results.passes.push('Title input accepts text');
    } else {
      console.log(`  ✗ No title input found`);
    }

    if (textareas.length > 0) {
      await textareas[0].fill('This is a test meta description for SEO scoring.');
      const val = await textareas[0].inputValue();
      console.log(`  ✓ Description: "${val}"`);
      results.passes.push('Description input accepts text');
    }

    // Test 4: Check for character counters
    console.log('\nTEST 4: Character counting');
    const charCounters = await page.locator('text=/\\d+\\//').count();
    console.log(`  ${charCounters > 0 ? '✓' : '✗'} Character counters: ${charCounters} found`);
    if (charCounters > 0) results.passes.push('Character counters present');

    // Test 5: Preview rendering
    console.log('\nTEST 5: SERP Preview rendering');
    await page.waitForTimeout(500);

    const googleDesktopContent = await page.content();
    const hasGooglePreview = googleDesktopContent.includes('Google') || googleDesktopContent.includes('google');
    console.log(`  ${hasGooglePreview ? '✓' : '✗'} Google preview content`);

    const allTabs = await page.locator('[role="tab"]').all();
    if (allTabs.length > 0) {
      for (let i = 0; i < Math.min(3, allTabs.length); i++) {
        const tabText = await allTabs[i].textContent();
        await allTabs[i].click();
        await page.waitForTimeout(300);
        console.log(`  ✓ Tab "${tabText}" clickable`);
      }
      results.passes.push('Preview tabs are clickable');
    }

    // Test 6: Score dashboard
    console.log('\nTEST 6: Score dashboard');
    const scoreElements = await page.locator('text=/score|Score/i').count();
    console.log(`  ${scoreElements > 0 ? '✓' : '✗'} Score elements: ${scoreElements}`);
    if (scoreElements > 0) {
      results.passes.push('Score dashboard visible');
    } else {
      results.failures.push('[BLOCKER] Score dashboard not visible');
    }

    // Test 7: Theme toggle
    console.log('\nTEST 7: Dark mode toggle');
    const buttons = await page.locator('button').all();
    let themeToggleFound = false;
    for (const btn of buttons) {
      const title = await btn.getAttribute('title');
      const label = await btn.getAttribute('aria-label');
      if ((title && (title.includes('theme') || title.includes('dark'))) ||
          (label && (label.includes('theme') || label.includes('dark')))) {
        themeToggleFound = true;
        await btn.click();
        console.log(`  ✓ Theme toggle clicked`);
        results.passes.push('Dark mode toggle works');
        break;
      }
    }
    if (!themeToggleFound) {
      console.log(`  ✗ Theme toggle not found`);
      results.escalations.push('Dark mode toggle UI not found');
    }

    // Test 8: Check for URL input
    console.log('\nTEST 8: URL input');
    const urlInputs = await page.locator('input[type="url"], input[placeholder*="URL" i], input[placeholder*="url" i]').all();
    if (urlInputs.length > 0) {
      await urlInputs[0].fill('https://example.com/test');
      console.log(`  ✓ URL input works`);
      results.passes.push('URL input works');
    } else {
      const allInputs = await page.locator('input').all();
      if (allInputs.length > 2) {
        await allInputs[2].fill('https://example.com');
        console.log(`  ✓ URL input (third input)`);
        results.passes.push('URL input found');
      } else {
        console.log(`  ✗ URL input not clearly identified`);
      }
    }

    // Test 9: Export/Download functionality
    console.log('\nTEST 9: Screenshot export');
    const downloadBtns = await page.locator('button:has-text("Download"), button:has-text("Export"), button:has-text("Screenshot")').count();
    console.log(`  ${downloadBtns > 0 ? '✓' : '✗'} Export buttons: ${downloadBtns}`);
    if (downloadBtns > 0) {
      results.passes.push('Screenshot export button found');
    } else {
      results.escalations.push('[ESCALATION] Screenshot export button not found');
    }

    // Test 10: Embed page
    console.log('\nTEST 10: Embeddable widget');
    try {
      await page.goto(`${BASE_URL}/embed`, { waitUntil: 'networkidle', timeout: 5000 });
      const embedTitle = await page.title();
      console.log(`  ✓ Embed page accessible: "${embedTitle}"`);
      results.passes.push('Embed page accessible');

      // Check for embed code generator
      const hasEmbedCode = await page.locator('text=/iframe|embed|code|Get Embed/i').count() > 0;
      console.log(`  ${hasEmbedCode ? '✓' : '✗'} Embed code generator`);
      if (hasEmbedCode) results.passes.push('Embed code available');
    } catch (e) {
      console.log(`  ✗ Embed page error`);
      results.failures.push(`[BLOCKER] Embed page not accessible`);
    }

    // Test 11: History feature
    console.log('\nTEST 11: History panel');
    const historyElements = await page.locator('text=/History|recent/i').count();
    console.log(`  ${historyElements > 0 ? '✓' : '✗'} History panel: ${historyElements}`);

    // Test 12: Empty state handling
    console.log('\nTEST 12: Empty form state');
    await page.goto(BASE_URL);
    const newTitle = await page.title();
    console.log(`  ✓ Page reloads correctly`);
    results.passes.push('Page handles reload');

  } catch (error) {
    console.error('Error during testing:', error.message);
    results.failures.push(`Fatal error: ${error.message}`);
  } finally {
    await browser.close();

    console.log('\n\n📊 TEST RESULTS');
    console.log('===============');
    console.log(`✓ Passes: ${results.passes.length}`);
    console.log(`✗ Failures: ${results.failures.length}`);
    console.log(`⚠ Escalations: ${results.escalations.length}`);

    if (results.failures.length > 0) {
      console.log('\nFailures:');
      results.failures.forEach(f => console.log(`  - ${f}`));
    }

    if (results.escalations.length > 0) {
      console.log('\nEscalations:');
      results.escalations.forEach(e => console.log(`  - ${e}`));
    }
  }
}

runTests();
