const { chromium } = require('../node_modules/playwright-core');

(async () => {
  console.log('🚀 Memulai pengujian pelaporan akun kader Akhmad Sudaisi -> Dashboard Nakes...');
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

  try {
    // 1. Set user kader: Akhmad Sudaisi
    await page.goto('http://127.0.0.1:5500/index.html');
    await page.waitForLoadState('domcontentloaded');

    const result = await page.evaluate(async () => {
      // Simulasikan user login sebagai Akhmad Sudaisi (Kader Jiwa)
      const kaderUser = {
        id: 88,
        name: "Akhmad Sudaisi",
        phone: "085211223344",
        role: "KADER",
        village_id: 1,
        village_name: "Kokop"
      };
      localStorage.setItem('malekkas_user', JSON.stringify(kaderUser));
      localStorage.setItem('malekkas_token', 'token_sudaisi_' + Date.now());

      // Panggil createReport langsung via adapter
      const adapter = window.firebaseAdapter || window.malekkasEngine;
      const repRes = await adapter.createReport({
        patient_name: "Munadi",
        address: "Kokop Timur",
        village_id: 1,
        village_name: "Kokop",
        report_type: "Kasus Pasung",
        description: "Temuan pasung baru di Kokop Timur",
        latitude: -7.0145,
        longitude: 113.0234
      }, kaderUser);

      // Simulasikan validasi EWS oleh nakes menjadi kasus (activateSiagaEws)
      const nakesUser = {
        id: 2,
        name: "dr. Siti Amelia",
        phone: "081234567890",
        role: "NAKES",
        village_id: 1,
        village_name: "Kokop"
      };
      const siagaRes = await adapter.activateSiagaEws({
        report_id: repRes.data.report_id,
        guru_id: 4,
        rato_id: 5,
        notes: "Aktivasi penanganan segera"
      }, nakesUser);

      // Ambil daftar kasus terbaru
      const casesRes = await adapter.getCases();
      const munadiCase = casesRes.data.find(c => c.patient_name === "Munadi");

      return {
        repRes,
        siagaRes,
        munadiCase
      };
    });

    console.log('Hasil Create Report:', result.repRes);
    console.log('Hasil Activate Siaga EWS:', result.siagaRes);
    console.log('Data Kasus Munadi:', {
      patient_name: result.munadiCase?.patient_name,
      reporter_name: result.munadiCase?.reporter_name,
      reporter_phone: result.munadiCase?.reporter_phone
    });

    if (result.munadiCase && result.munadiCase.reporter_name === "Akhmad Sudaisi") {
      console.log('✅ [PASS] Sukses! Kasus Munadi tercatat dengan nama pelapor: ' + result.munadiCase.reporter_name);
    } else {
      console.error('❌ [FAIL] Nama pelapor pada kasus masih: ' + (result.munadiCase ? result.munadiCase.reporter_name : 'null'));
    }

    // 2. Sekarang muat UI sebagai Nakes dan pastikan kartu kasus menampilkan "Akhmad Sudaisi"
    await page.evaluate(() => {
      const nakesUser = {
        id: 2,
        name: "dr. Siti Amelia",
        phone: "081234567890",
        role: "NAKES",
        village_id: 1,
        village_name: "Kokop"
      };
      localStorage.setItem('malekkas_user', JSON.stringify(nakesUser));
      localStorage.setItem('malekkas_token', 'token_nakes_' + Date.now());
    });

    await page.goto('http://127.0.0.1:5500/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Tunggu hingga nakesAksiList selesai diisi oleh loadData()
    await page.waitForFunction(() => {
      const el = document.getElementById('nakesAksiList');
      return el && el.children.length > 0;
    }, { timeout: 15000 });

    const currentUrl = page.url();
    console.log('Current URL setelah navigasi:', currentUrl);

    // Ambil teks dari kartu kasus di UI
    const debugInfo = await page.evaluate(() => {
      const container = document.getElementById('nakesAksiList');
      const cards = container ? Array.from(container.children).map(c => c.innerText.replace(/\s+/g, ' ').trim()) : [];
      return {
        cardsCount: cards.length,
        cards
      };
    });

    console.log('\n--- Debug UI Nakes ---', JSON.stringify(debugInfo, null, 2));

    console.log('\n--- Debug UI Nakes ---', JSON.stringify(debugInfo, null, 2));

    const cardMunadi = (debugInfo.cards || []).find(c => c.toLowerCase().includes('munadi'));
    if (cardMunadi && cardMunadi.includes('Akhmad Sudaisi')) {
      console.log('✅ [PASS] Di Dashboard Nakes, nama Bhupa\' Bhabu\' terbukti tampil sebagai Akhmad Sudaisi (085211223344)!');
    } else {
      console.error('❌ [FAIL] Kartu Munadi di UI:', cardMunadi);
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
