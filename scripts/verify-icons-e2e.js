const { chromium } = require('../node_modules/playwright-core');
const path = require('path');

(async () => {
  console.log('🚀 [E2E] Running Role Iconset & Bhu\' Ghuru Verification...');
  const browser = await chromium.launch({ 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });
  
  // 1. Test Register Page
  const page = await browser.newPage({ viewport: { width: 520, height: 860 } });
  const regUrl = 'file:///' + path.resolve('register.html').replace(/\\/g, '/');
  await page.goto(regUrl, { waitUntil: 'load' });
  await page.evaluate(() => {
    const s = document.getElementById('appSplashScreen');
    if (s) s.classList.add('splash-hidden');
  });
  await page.waitForTimeout(400);

  // Click on Bhu' Ghuru radio card
  await page.click('label:has(input[value="GURU"])');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-register-bhu-ghuru-selected.png' });
  console.log('✅ Screenshot saved: test-register-bhu-ghuru-selected.png');

  // 2. Test Dashboard / index.html (Nakes role)
  const dashboardPage = await browser.newPage({ viewport: { width: 1280, height: 880 } });
  await dashboardPage.addInitScript(() => {
    const testUser = {
      id: 1,
      name: 'dr. Siti Aminah, Sp.KJ',
      role: 'NAKES',
      phone: '081234567890',
      village_name: 'Kokop'
    };
    localStorage.setItem('malekkas_user', JSON.stringify(testUser));
    localStorage.setItem('malekkas_token', 'token-test-123');
  });
  const indexUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await dashboardPage.goto(indexUrl, { waitUntil: 'load' });
  await dashboardPage.evaluate(() => {
    const s = document.getElementById('appSplashScreen');
    if (s) s.classList.add('splash-hidden');
  });
  await dashboardPage.waitForTimeout(800);
  await dashboardPage.screenshot({ path: 'test-dashboard-nakes-iconset.png' });
  console.log('✅ Screenshot saved: test-dashboard-nakes-iconset.png');

  // Open first case detail modal
  await dashboardPage.evaluate(() => {
    if (typeof selectCaseDetail === 'function') selectCaseDetail(1);
  });
  await dashboardPage.waitForTimeout(500);
  await dashboardPage.screenshot({ path: 'test-detail-modal-iconset.png' });
  console.log('✅ Screenshot saved: test-detail-modal-iconset.png');

  // 3. Test Bhu' Ghuru Dashboard View
  const guruPage = await browser.newPage({ viewport: { width: 500, height: 800 } });
  await guruPage.addInitScript(() => {
    const guruUser = {
      id: 2,
      name: 'Kiai H. Kholil',
      role: 'GURU',
      phone: '081234567892',
      village_name: 'Kokop'
    };
    localStorage.setItem('malekkas_user', JSON.stringify(guruUser));
    localStorage.setItem('malekkas_token', 'token-test-123');
  });
  await guruPage.goto(indexUrl, { waitUntil: 'load' });
  await guruPage.evaluate(() => {
    const s = document.getElementById('appSplashScreen');
    if (s) s.classList.add('splash-hidden');
  });
  await guruPage.waitForTimeout(800);
  await guruPage.screenshot({ path: 'test-guru-dashboard-iconset.png' });
  console.log('✅ Screenshot saved: test-guru-dashboard-iconset.png');

  await browser.close();
  console.log('🎉 E2E Verification Complete!');
})();
