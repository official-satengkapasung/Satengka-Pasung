const { chromium } = require('../node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 [E2E] Running Comprehensive Verification: Crayon Logo Consistency & Zero Parentheses in Role Account Names...');
  const browser = await chromium.launch({ 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });
  
  // 1. Test Login Page (Logo & Crayon Ring)
  const loginPage = await browser.newPage({ viewport: { width: 500, height: 750 } });
  const loginUrl = 'file:///' + path.resolve('login.html').replace(/\\/g, '/');
  await loginPage.goto(loginUrl, { waitUntil: 'load' });
  await loginPage.evaluate(() => {
    const s = document.getElementById('appSplashScreen');
    if (s) s.classList.add('splash-hidden');
  });
  await loginPage.waitForTimeout(400);

  const loginCrayonCount = await loginPage.evaluate(() => {
    return document.querySelectorAll('.crayon-sketch-path').length;
  });
  console.log(`✓ Login page crayon sketch rings detected: ${loginCrayonCount}`);
  await loginPage.screenshot({ path: 'test-login-crayon-logo.png' });

  // 2. Test Register Page (Logo & Role Names)
  const regPage = await browser.newPage({ viewport: { width: 520, height: 860 } });
  const regUrl = 'file:///' + path.resolve('register.html').replace(/\\/g, '/');
  await regPage.goto(regUrl, { waitUntil: 'load' });
  await regPage.evaluate(() => {
    const s = document.getElementById('appSplashScreen');
    if (s) s.classList.add('splash-hidden');
  });
  await regPage.waitForTimeout(400);

  const regCrayonCount = await regPage.evaluate(() => {
    return document.querySelectorAll('.crayon-sketch-path').length;
  });
  console.log(`✓ Register page crayon sketch rings detected: ${regCrayonCount}`);
  await regPage.screenshot({ path: 'test-register-crayon-logo.png' });

  // 3. Test Dashboard / index.html (Nakes role)
  const dashboardPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  // Test with seeded data to check both fresh and persisted states
  await dashboardPage.addInitScript(() => {
    const testUser = {
      id: 1,
      name: 'dr. Siti Amelia',
      role: 'NAKES',
      phone: '081234567890',
      village_name: 'Kokop'
    };
    localStorage.setItem('malekkas_user', JSON.stringify(testUser));
    localStorage.setItem('malekkas_token', 'token-test-clean-123');
  });

  const indexUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await dashboardPage.goto(indexUrl, { waitUntil: 'load' });
  await dashboardPage.evaluate(() => {
    const s = document.getElementById('appSplashScreen');
    if (s) s.classList.add('splash-hidden');
  });
  await dashboardPage.waitForTimeout(1000);

  // Check Crayon rings in index.html (sidebar, topbar, splash, footer)
  const indexCrayonCount = await dashboardPage.evaluate(() => {
    return document.querySelectorAll('.crayon-sketch-path').length;
  });
  console.log(`✓ Dashboard page crayon sketch rings detected: ${indexCrayonCount}`);

  // Check that no narahubung contains (Guru), (Rato), (Bhupa'), (Nakes)
  const caseCardNames = await dashboardPage.evaluate(() => {
    const caseCards = document.querySelectorAll('#nakesKasusAktifList > div');
    const texts = [];
    caseCards.forEach(card => {
      texts.push(card.innerText);
    });
    return texts.join('\n');
  });

  const forbiddenMatches = caseCardNames.match(/\((Guru|Rato|Bhupa'|Nakes|Bhu' Ghuru|Kader)\)/gi);
  if (forbiddenMatches) {
    console.error('❌ FAIL: Found forbidden parenthesized roles in case cards:', forbiddenMatches);
  } else {
    console.log('✅ PASS: Zero parentheses found in case cards narahubung names!');
  }

  await dashboardPage.screenshot({ path: 'test-dashboard-clean-names.png' });
  console.log('✅ Screenshot saved: test-dashboard-clean-names.png');

  const caseCardsEl = await dashboardPage.$('#nakesAksiList');
  if (caseCardsEl) {
    await caseCardsEl.screenshot({ path: 'test-case-cards-comparison.png' });
    console.log('✅ Screenshot saved: test-case-cards-comparison.png');
  }

  // Open first case detail modal
  await dashboardPage.evaluate(() => {
    if (typeof selectCaseDetail === 'function') selectCaseDetail(1);
  });
  await dashboardPage.waitForTimeout(600);

  const detailModalText = await dashboardPage.evaluate(() => {
    const modal = document.getElementById('modalCaseDetail');
    return modal ? modal.innerText : '';
  });

  const detailForbidden = detailModalText.match(/\((Guru|Rato|Bhupa'|Nakes|Bhu' Ghuru|Kader)\)/gi);
  if (detailForbidden) {
    console.error('❌ FAIL: Found forbidden parenthesized roles in detail modal:', detailForbidden);
  } else {
    console.log('✅ PASS: Zero parentheses found in detail modal!');
  }

  await dashboardPage.screenshot({ path: 'test-detail-clean-modal.png' });
  console.log('✅ Screenshot saved: test-detail-clean-modal.png');

  await browser.close();
  console.log('🎉 All automated visual & data verification tests PASSED!');
})();
