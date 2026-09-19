const { chromium } = require('../node_modules/playwright-core');

(async () => {
  console.log('Testing all 4 accounts login...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  const accounts = [
    { name: 'dr. Siti Amelia', phone: '081234567890', pass: 'nakes123', role: 'NAKES' },
    { name: 'Siti Aminah', phone: '081234567891', pass: 'kader123', role: 'KADER' },
    { name: 'Kiai H. Kholil', phone: '081234567892', pass: 'guru123', role: 'GURU' },
    { name: 'Klebun Kokop', phone: '081234567893', pass: 'rato123', role: 'RATO' }
  ];

  for (const acc of accounts) {
    await page.goto('http://127.0.0.1:5500/login.html');
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      if (window.firebaseReadyPromise) await window.firebaseReadyPromise;
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.fill('#loginUsername', acc.phone);
    await page.fill('#loginPassword', acc.pass);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL('**/index.html', { timeout: 7000 });
      const user = await page.evaluate(() => JSON.parse(localStorage.getItem('malekkas_user') || '{}'));
      console.log(`✅ [PASS] ${acc.name} (${acc.role}): Login BERHASIL! User: ${user.name}`);
    } catch (err) {
      const errorText = await page.textContent('.swal2-html-container').catch(() => 'No alert');
      console.error(`❌ [FAIL] ${acc.name} (${acc.role}): Login GAGAL! Msg: ${errorText}`);
    }
  }

  await browser.close();
  process.exit(0);
})();
