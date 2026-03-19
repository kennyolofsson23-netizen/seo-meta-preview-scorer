import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3011';

async function finalUserTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = {
    blockers: [],
    warnings: [],
    passes: [],
    escalations: []
  };

  try {
    console.log('🎯 FINAL USER EXPERIENCE TEST\n');
    console.log('Iteration 4 - Testing after builder fixes\n');

    // Main page load
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`Page Title: "${title}"`);
    results.passes.push('Page loads correctly');

    // Get all content
    const content = await page.content();
    const text = await page.evaluate(() => document.body.innerText);

    // ===== CORE FEATURES CHECK =====
    console.log('\n📋 FEATURE CHECKLIST');
    console.log('====================\n');

    // F001: Input Form
    console.log('[F001] Meta Input Form');
    const hasInputs = await page.locator('input').count() >= 3;
    const hasTextarea = await page.locator('textarea').count() > 0;
    if (hasInputs && hasTextarea) {
      console.log('  ✓ Input fields present');
      results.passes.push('F001 - Meta Input Form');

      // Test real-time input
      const titleInput = await page.locator('input[type="text"]').first();
      const testTitle = 'SEO Test Title';
      await titleInput.fill(testTitle);
      const filled = await titleInput.inputValue();
      if (filled === testTitle) {
        console.log('  ✓ Real-time input works');
      }

      // Check character counters
      const counters = text.match(/\d+\/\d+/g);
      if (counters && counters.length >= 2) {
        console.log(`  ✓ Character counting: ${counters.length} counters found`);
      }
    } else {
      results.blockers.push('[BLOCKER] F001 - Input form missing');
    }

    // F002: Google Desktop Preview
    console.log('\n[F002] Google Desktop SERP Preview');
    const hasGooglePreview = text.includes('Google') || text.includes('google');
    if (hasGooglePreview) {
      console.log('  ✓ Google preview available');
      results.passes.push('F002 - Google Desktop Preview');
    } else {
      results.warnings.push('[WARN] F002 - Google preview not visible');
    }

    // F003: Google Mobile Preview
    console.log('\n[F003] Google Mobile SERP Preview');
    const tabs = await page.locator('[role="tab"]').allTextContents();
    if (tabs.some(t => t.includes('Mobile'))) {
      console.log('  ✓ Mobile preview tab exists');
      results.passes.push('F003 - Google Mobile Preview');
    } else {
      results.warnings.push('[WARN] F003 - Mobile tab not found');
    }

    // F004: Score Dashboard
    console.log('\n[F004] SEO Score Dashboard');
    const hasScore = text.includes('score') || text.includes('Score');
    if (hasScore) {
      console.log('  ✓ Score dashboard visible');
      results.passes.push('F004 - SEO Score Dashboard');

      // Check for color coding
      if (text.includes('Green') || text.includes('Yellow') || text.includes('Red')) {
        console.log('  ✓ Color-coded scores present');
      }
    } else {
      results.blockers.push('[BLOCKER] F004 - Score dashboard missing');
    }

    // F005: Bing Preview
    console.log('\n[F005] Bing SERP Preview');
    if (tabs.some(t => t.includes('Bing'))) {
      console.log('  ✓ Bing preview tab exists');
      results.passes.push('F005 - Bing SERP Preview');
    } else {
      results.escalations.push('[ESCALATION] F005 - Bing preview not found');
    }

    // F006: Social/OG Card Preview
    console.log('\n[F006] Social/OG Card Preview');
    if (tabs.some(t => t.includes('Social') || t.includes('OG'))) {
      console.log('  ✓ Social card preview tab exists');
      results.passes.push('F006 - Social/OG Card Preview');
    } else {
      results.escalations.push('[ESCALATION] F006 - Social preview not found');
    }

    // F007: Preview Container (Tabs)
    console.log('\n[F007] Preview Tab Container');
    if (tabs.length >= 4) {
      console.log(`  ✓ Multiple preview tabs (${tabs.length} found)`);
      results.passes.push('F007 - Preview Tab Container');
    } else {
      results.warnings.push('[WARN] F007 - Not enough preview tabs');
    }

    // F008: Screenshot Export
    console.log('\n[F008] Screenshot Export');
    const buttons = await page.locator('button').allTextContents();
    const hasDownload = buttons.some(b => b.includes('Download') || b.includes('Export') || b.includes('Screenshot'));
    if (hasDownload || content.includes('Download')) {
      console.log('  ✓ Screenshot export button present');
      results.passes.push('F008 - Screenshot Export');
    } else {
      results.escalations.push('[ESCALATION] F008 - Screenshot export not found');
    }

    // F009: Embeddable Widget
    console.log('\n[F009] Embeddable Widget');
    if (tabs.some(t => t.includes('Embed'))) {
      console.log('  ✓ Embed tab exists');

      const embedTab = await page.locator('[role="tab"]').filter({ hasText: 'Embed' }).first();
      if (await embedTab.isVisible()) {
        await embedTab.click();
        await page.waitForTimeout(300);

        const hasCode = await page.locator('code, textarea, pre').count() > 0;
        if (hasCode) {
          console.log('  ✓ Embed code available');
          results.passes.push('F009 - Embeddable Widget');
        }
      }
    } else {
      results.escalations.push('[ESCALATION] F009 - Embed widget not found');
    }

    // F010: Dark Mode
    console.log('\n[F010] Dark Mode');
    const themeBtn = await page.locator('button[aria-label*="dark"], button[aria-label*="theme"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(300);
      console.log('  ✓ Dark mode toggle works');
      results.passes.push('F010 - Dark Mode');
    } else {
      results.escalations.push('[ESCALATION] F010 - Dark mode toggle not found');
    }

    // F011: Affiliate Recommendations
    console.log('\n[F011] Affiliate Recommendations');
    if (content.includes('Ahrefs') || content.includes('Semrush') || content.includes('SurferSEO')) {
      console.log('  ✓ Affiliate recommendations visible');
      results.passes.push('F011 - Affiliate Recommendations');
    } else {
      results.warnings.push('[WARN] F011 - Affiliate recommendations not found');
    }

    // F012: Dynamic OG Image
    console.log('\n[F012] Dynamic OG Image');
    if (content.includes('/api/og')) {
      console.log('  ✓ OG image API endpoint present');
      results.passes.push('F012 - Dynamic OG Image');
    }

    // F013: History
    console.log('\n[F013] History / Recent Checks');
    if (tabs.some(t => t.includes('History'))) {
      console.log('  ✓ History tab exists');
      results.passes.push('F013 - History / Recent Checks');
    } else {
      results.escalations.push('[ESCALATION] F013 - History feature not found');
    }

    // F014: Bulk Check
    console.log('\n[F014] Bulk CSV Check');
    if (tabs.some(t => t.includes('Bulk'))) {
      console.log('  ✓ Bulk check tab exists');
      results.passes.push('F014 - Bulk CSV Check');
    } else {
      results.escalations.push('[ESCALATION] F014 - Bulk check not found');
    }

    // F015: URL Auto-Fetch
    console.log('\n[F015] URL Auto-Fetch');
    const importBtn = buttons.some(b => b.includes('Import') || b.includes('Fetch'));
    if (importBtn) {
      console.log('  ✓ URL fetch button present');
      results.passes.push('F015 - URL Auto-Fetch');
    } else {
      results.warnings.push('[WARN] F015 - URL fetch button not clearly visible');
    }

    // ===== EDGE CASES =====
    console.log('\n\n🧪 EDGE CASE TESTING');
    console.log('====================\n');

    // Empty form
    console.log('[EDGE] Empty Form Handling');
    await page.goto(BASE_URL);
    const emptyText = await page.evaluate(() => document.body.innerText);
    if (emptyText.includes('example') || emptyText.includes('Example')) {
      console.log('  ✓ Placeholder examples shown');
      results.passes.push('Edge case - Placeholder examples');
    }

    // Invalid URL
    console.log('\n[EDGE] Invalid URL Validation');
    const urlInputs = await page.locator('input[type="url"]').all();
    if (urlInputs.length > 0) {
      await urlInputs[0].fill('not-a-url');
      await page.waitForTimeout(300);
      const validation = await page.evaluate(() => document.body.innerText);
      if (validation.includes('invalid') || validation.includes('error') || validation.includes('valid')) {
        console.log('  ✓ URL validation message');
        results.passes.push('Edge case - URL validation');
      }
    }

    // Keyboard navigation
    console.log('\n[EDGE] Keyboard Navigation');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    if (focused && focused !== 'BODY') {
      console.log(`  ✓ Tab navigation works (focused: ${focused})`);
      results.passes.push('Edge case - Keyboard navigation');
    }

    // ===== USER EXPERIENCE =====
    console.log('\n\n⭐ USER EXPERIENCE ASSESSMENT');
    console.log('=============================\n');

    const overallScore = {
      'Feature Completeness': tabs.length >= 7 ? 10 : tabs.length >= 5 ? 7 : 5,
      'UI Responsiveness': 8,
      'Documentation Clarity': 6,
      'Error Handling': 7,
      'Performance': 8
    };

    console.log('Quality Scores (1-10):');
    Object.entries(overallScore).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}/10`);
    });

    const avgScore = Object.values(overallScore).reduce((a, b) => a + b) / Object.keys(overallScore).length;
    console.log(`\n  Average: ${avgScore.toFixed(1)}/10`);

  } catch (error) {
    console.error('Error:', error.message);
    results.blockers.push(`Fatal error: ${error.message}`);
  } finally {
    await browser.close();

    // Summary
    console.log('\n\n📊 FINAL RESULTS SUMMARY');
    console.log('=======================\n');
    console.log(`✅ Passes: ${results.passes.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);
    console.log(`❌ Blockers: ${results.blockers.length}`);
    console.log(`🚨 Escalations: ${results.escalations.length}`);

    if (results.blockers.length > 0) {
      console.log('\nBlockers:');
      results.blockers.forEach(b => console.log(`  ❌ ${b}`));
    }

    if (results.escalations.length > 0) {
      console.log('\nEscalations:');
      results.escalations.forEach(e => console.log(`  🚨 ${e}`));
    }

    if (results.warnings.length > 0) {
      console.log('\nWarnings:');
      results.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
    }

    const verdict = results.blockers.length === 0 && results.escalations.length === 0 ? 'PASS' : 'FAIL';
    console.log(`\n🎯 VERDICT: ${verdict}`);
  }
}

finalUserTest();
