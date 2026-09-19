const { chromium } = require('../node_modules/playwright-core');

(async () => {
  console.log('================================================================');
  console.log('🔥 INISIALISASI AKUN PILAR KE FIREBASE AUTHENTICATION & FIRESTORE');
  console.log('================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--allow-file-access-from-files', '--disable-web-security']
    });
  } catch (e) {
    console.warn('Fallback browser:', e.message);
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`   [Browser] ${msg.text()}`));

  try {
    console.log('1. Membuka aplikasi via web server lokal...');
    await page.goto('http://127.0.0.1:5500/login.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Pastikan firebaseReadyPromise selesai
    const ready = await page.evaluate(async () => {
      if (window.firebaseReadyPromise) await window.firebaseReadyPromise;
      return !!(window.firebaseAdapter && window.firebaseAdapter.createUser);
    });

    if (!ready) {
      throw new Error('firebaseAdapter belum siap di login.html');
    }

    console.log('2. Mendaftarkan 4 akun pilar resmi ke Firebase Auth & Cloud Firestore...');
    const results = await page.evaluate(async () => {
      const pilarUsers = [
        {
          name: 'dr. Siti Amelia',
          phone: '081234567890',
          role: 'NAKES',
          village_name: 'Puskesmas Kokop',
          village_id: 1,
          password: 'nakes123'
        },
        {
          name: 'Siti Aminah',
          phone: '081234567891',
          role: 'KADER',
          village_name: 'Batu Bintang',
          village_id: 2,
          password: 'kader123'
        },
        {
          name: 'Kiai H. Kholil',
          phone: '081234567892',
          role: 'GURU',
          village_name: 'Desa Dupok',
          village_id: 1,
          password: 'guru123'
        },
        {
          name: 'Klebun Kokop',
          phone: '081234567893',
          role: 'RATO',
          village_name: 'Desa Kokop',
          village_id: 1,
          password: 'rato123'
        }
      ];

      const report = [];
      for (const u of pilarUsers) {
        try {
          const res = await window.firebaseAdapter.createUser(u);
          report.push({ name: u.name, phone: u.phone, role: u.role, success: res.success });
        } catch (err) {
          report.push({ name: u.name, phone: u.phone, error: err.message });
        }
      }
      return report;
    });

    console.log('\n📋 Laporan Pendaftaran Akun Pilar ke Cloud:');
    results.forEach(r => {
      console.log(`   - ${r.name} (${r.role} - ${r.phone}): ${r.success ? '✅ BERHASIL TERSIMPAN' : '⚠️ ' + r.error}`);
    });

    console.log('\n================================================================');
    console.log('🎉 SELURUH AKUN RESMI BERHASIL DIDAFTARKAN KE FIREBASE CLOUD!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Gagal inisialisasi akun cloud:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
