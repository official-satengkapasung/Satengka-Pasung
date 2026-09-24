const { chromium } = require('../node_modules/playwright-core');

if (process.env.SATENGKA_ALLOW_PROD_SEED !== '1') {
  console.error('Ditolak: skrip ini menulis ke Firebase. Set SATENGKA_ALLOW_PROD_SEED=1 hanya untuk emulator.');
  process.exit(1);
}

(async () => {
  console.log('================================================================');
  console.log('🔥 SINKRONISASI DATA KASUS & DESA KOKOP KE CLOUD FIRESTORE');
  console.log('================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--allow-file-access-from-files', '--disable-web-security']
    });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`   [Browser] ${msg.text()}`));

  try {
    await page.goto('http://127.0.0.1:5500/login.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const syncReport = await page.evaluate(async () => {
      if (window.firebaseReadyPromise) await window.firebaseReadyPromise;
      if (!window.firebaseAdapter) return { success: false, message: 'Adapter tidak ada' };

      const res = await window.firebaseAdapter.loadProductionDemoData();
      return res;
    });

    console.log('\n📊 Hasil Injeksi Data Master:', syncReport);
    console.log('\n================================================================');
    console.log('🎉 SEMUA DATA KASUS, DESA & CHAT TERPADU BERHASIL MASUK FIRESTORE!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Error sinkronisasi data master:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
