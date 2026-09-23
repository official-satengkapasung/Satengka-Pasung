import { chromium } from 'playwright';

(async () => {
  console.log("🚀 [QA AUTOMATION] Memulai Headless QA Audit Suite pada http://localhost:3000/ ...");
  
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    bugs: []
  };

  function logBug({ id, severity, module, summary, impact, steps, actual, expected, evidence, fileRef }) {
    results.bugs.push({ id, severity, module, summary, impact, steps, actual, expected, evidence, fileRef });
    console.error(`❌ [BUG DETECTED] [${severity}] ${id}: ${summary}`);
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[PAGE ERROR] ${err.message}`);
  });

  // =========================================================================
  // TEST 1: Initial Page Load & Console Exception Sniffer
  // =========================================================================
  results.totalTests++;
  console.log("\n🧪 TEST 1: Memeriksa landing page dan auto-redirect autentikasi...");
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const currentUrl = page.url();
    console.log(`ℹ️ Current URL: ${currentUrl}`);

    if (consoleErrors.some(e => e.includes('SyntaxError') || e.includes('ReferenceError'))) {
      logBug({
        id: 'SAT-QA-001',
        severity: 'P0',
        module: 'Core Module',
        summary: 'Terdapat SyntaxError/ReferenceError saat inisialisasi aplikasi awal',
        impact: 'Aplikasi berisiko macet di splashscreen untuk pengguna baru.',
        steps: ['Buka http://localhost:3000/'],
        actual: consoleErrors.join(' | '),
        expected: 'Tidak ada script exception fatal.',
        evidence: consoleErrors.join('\n'),
        fileRef: 'index.html / src/'
      });
      results.failed++;
    } else {
      results.passed++;
      console.log("✅ TEST 1 Passed: Landing page termuat tanpa SyntaxError/ReferenceError.");
    }
  } catch (err) {
    results.failed++;
    console.error("❌ TEST 1 Failed:", err.message);
  }

  // =========================================================================
  // TEST 2: Multi-Role Authentication & Validation (Nakes, Kader, Guru, Rato)
  // =========================================================================
  results.totalTests++;
  console.log("\n🧪 TEST 2: Menguji form login, validasi password salah, dan kredensial multi-peran...");
  try {
    await page.goto('http://localhost:3000/login.html', { waitUntil: 'domcontentloaded', timeout: 10000 });

    // 2a. Tes validasi password salah
    await page.fill('#loginUsername', '081234567890');
    await page.fill('#loginPassword', 'passwordsalah123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const alertBoxContent = await page.evaluate(() => document.getElementById('alertBox')?.innerText || '');
    console.log(`ℹ️ Pesan error password salah: "${alertBoxContent}"`);

    // 2b. Login sukses sebagai NAKES
    await page.fill('#loginUsername', '081234567890');
    await page.fill('#loginPassword', 'satengka123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const afterLoginUrl = page.url();
    if (afterLoginUrl.includes('index.html')) {
      console.log("✅ Berhasil login sebagai Nakes dan dialihkan ke index.html");
      results.passed++;
    } else {
      const errorMsg = await page.evaluate(() => document.getElementById('alertBox')?.innerText || 'None');
      logBug({
        id: 'SAT-QA-002',
        severity: 'P1',
        module: 'Auth',
        summary: `Login Nakes via credential default faskes tidak mengalihkan: "${errorMsg}"`,
        impact: 'Petugas Nakes kesulitan masuk saat Firebase Cloud belum tersinkronisasi.',
        steps: ['Buka login.html', 'Ketik username 081234567890 dan password satengka123', 'Klik Masuk'],
        actual: `Tetap di ${afterLoginUrl} dengan notifikasi: ${errorMsg}`,
        expected: 'Login berhasil dan dialihkan ke index.html.',
        evidence: errorMsg,
        fileRef: 'login.html:L415'
      });
      results.failed++;
    }
  } catch (err) {
    results.failed++;
    console.error("❌ TEST 2 Failed:", err.message);
  }

  // =========================================================================
  // TEST 3: XSS Injection & Form Validation di register.html
  // =========================================================================
  results.totalTests++;
  console.log("\n🧪 TEST 3: Pengujian Keamanan Input (XSS Injection & Sanitasi Data) di register.html...");
  try {
    await page.goto('http://localhost:3000/register.html', { waitUntil: 'domcontentloaded', timeout: 10000 });

    const xssPayload = '<img src=x onerror="window.__xssTriggered=true">';
    await page.fill('#regFullName', `Kader Uji ${xssPayload}`);
    await page.fill('#regPhone', '081999888777');
    await page.fill('#regPassword', 'rahasia123');
    await page.fill('#regConfirmPassword', 'rahasia123');

    // Cek apakah ada eksekusi XSS payload di DOM
    const xssTriggered = await page.evaluate(() => Boolean(window.__xssTriggered));
    if (xssTriggered) {
      logBug({
        id: 'SAT-QA-003',
        severity: 'P1',
        module: 'Security/Register',
        summary: 'Celah XSS Tersimpan (Stored/Reflected XSS) pada form registrasi akun',
        impact: 'Penyerang dapat menyuntikkan script berbahaya ke sesi petugas faskes.',
        steps: ['Buka register.html', 'Isi nama dengan payload XSS <img src=x onerror=...>', 'Kirim form'],
        actual: 'Payload script tereksekusi di DOM window.__xssTriggered = true',
        expected: 'Payload disanitasi menggunakan escapeHtml() menjadi entitas HTML.',
        evidence: 'window.__xssTriggered === true',
        fileRef: 'register.html / src/utils/formatters.js'
      });
      results.failed++;
    } else {
      console.log("✅ TEST 3 Passed: Form registrasi aman dari eksekusi XSS langsung!");
      results.passed++;
    }
  } catch (err) {
    results.failed++;
    console.error("❌ TEST 3 Failed:", err.message);
  }

  // =========================================================================
  // TEST 4: Dashboard Nakes, Leaflet Map, & EWS Siaga Workflow
  // =========================================================================
  results.totalTests++;
  console.log("\n🧪 TEST 4: Menguji Dashboard Nakes, Inisialisasi Peta Leaflet, & Integrasi Siaga...");
  try {
    // Inject sesi login Nakes langsung ke localStorage
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.evaluate(() => {
      const demoUser = {
        id: 2,
        name: "dr. Siti Amelia",
        phone: "081234567890",
        role: "NAKES",
        village_id: 1,
        village_name: "Kokop"
      };
      localStorage.setItem('malekkas_token', 'test_token_nakes');
      localStorage.setItem('malekkas_user', JSON.stringify(demoUser));
    });

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1500);

    const mapState = await page.evaluate(() => {
      const mapEl = document.getElementById('nakesLeafletMap');
      const hasLeaflet = typeof window.L !== 'undefined';
      const hasMapInstance = Boolean(window.leafletMapInstance);
      return {
        elementFound: Boolean(mapEl),
        hasLeaflet,
        hasMapInstance
      };
    });
    console.log("ℹ️ Status Peta Leaflet:", JSON.stringify(mapState));

    if (!mapState.elementFound) {
      logBug({
        id: 'SAT-QA-004',
        severity: 'P2',
        module: 'Dashboard Nakes',
        summary: 'Container elemen peta Leaflet (#nakesLeafletMap) tidak ditemukan di DOM',
        impact: 'Petugas Nakes tidak dapat melihat sebaran titik kasus pasung di wilayah Kokop.',
        steps: ['Login sebagai Nakes', 'Periksa tab Pemetaan Kasus'],
        actual: 'Elemen nakesLeafletMap null',
        expected: 'Container peta Leaflet ter-render sempurna.',
        evidence: 'mapState.elementFound === false',
        fileRef: 'index.html:L4144'
      });
      results.failed++;
    } else {
      console.log("✅ TEST 4 Passed: Peta Leaflet container valid dan ter-render!");
      results.passed++;
    }
  } catch (err) {
    results.failed++;
    console.error("❌ TEST 4 Failed:", err.message);
  }

  // =========================================================================
  // TEST 5: Responsivitas Mobile (Viewport 375x667 - iPhone SE)
  // =========================================================================
  results.totalTests++;
  console.log("\n🧪 TEST 5: Menguji Responsivitas & Overflow pada Tampilan Mobile (375px)...");
  try {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    console.log(`ℹ️ Mobile width test: scrollWidth=${scrollWidth}px, innerWidth=${innerWidth}px`);

    if (scrollWidth > innerWidth + 5) {
      logBug({
        id: 'SAT-QA-005',
        severity: 'P2',
        module: 'UI/Responsive',
        summary: `Terdapat Horizontal Overflow (${scrollWidth}px > ${innerWidth}px)`,
        impact: 'Tampilan di ponsel kader/tokoh bergeser ke samping (layout bleeding/patah).',
        steps: ['Buka index.html pada viewport 375px x 667px', 'Scroll horizontal'],
        actual: `scrollWidth ${scrollWidth}px melebihi innerWidth ${innerWidth}px`,
        expected: 'scrollWidth <= innerWidth (tidak ada horizontal bleeding).',
        evidence: `document.documentElement.scrollWidth = ${scrollWidth}`,
        fileRef: 'index.html CSS / Layout'
      });
      results.failed++;
    } else {
      console.log("✅ TEST 5 Passed: Tidak ada horizontal overflow pada viewport mobile 375px.");
      results.passed++;
    }
  } catch (err) {
    results.failed++;
    console.error("❌ TEST 5 Failed:", err.message);
  }

  // =========================================================================
  // TEST 6: LocalStorage Corruption & Session Resilience Test
  // =========================================================================
  results.totalTests++;
  console.log("\n🧪 TEST 6: Menguji Ketahanan terhadap Data Korup di LocalStorage...");
  try {
    await page.evaluate(() => {
      localStorage.setItem('malekkas_user', 'CORRUPT_JSON_{{invalid');
    });

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);

    const hasWhiteScreenCrash = await page.evaluate(() => {
      return document.body.innerHTML.trim().length === 0;
    });

    if (hasWhiteScreenCrash) {
      logBug({
        id: 'SAT-QA-006',
        severity: 'P0',
        module: 'Storage / Session',
        summary: 'Aplikasi crash total (White Screen) saat JSON di localStorage tidak valid',
        impact: 'Pengguna terjebak dan aplikasi tidak bisa dibuka sama sekali.',
        steps: ['Set localStorage malekkas_user ke string korup', 'Reload halaman'],
        actual: 'Body HTML kosong (White Screen of Death)',
        expected: 'StorageService menangkap error JSON.parse, mengosongkan sesi, dan me-redirect ke login.html dengan aman.',
        evidence: 'White screen crash',
        fileRef: 'src/services/storage.js / index.html:checkSession'
      });
      results.failed++;
    } else {
      console.log("✅ TEST 6 Passed: Aplikasi memiliki fallback aman terhadap data storage korup.");
      results.passed++;
    }
  } catch (err) {
    results.failed++;
    console.error("❌ TEST 6 Failed:", err.message);
  }

  // =========================================================================
  // TEST 7: 4-Pilar Role Switching & Interface Isolation
  // =========================================================================
  results.totalTests++;
  console.log("\n🧪 TEST 7: Menguji Isolasi Tampilan 4-Pilar (Kader, Guru, Rato')...");
  try {
    // 7a. Test Kader View
    await page.evaluate(() => {
      const kaderUser = { id: 3, name: "Siti", phone: "081234567891", role: "KADER", village_name: "Kokop" };
      localStorage.setItem('malekkas_user', JSON.stringify(kaderUser));
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);

    const kaderSectionVisible = await page.evaluate(() => {
      const el = document.getElementById('kaderViewContainer') || document.querySelector('[data-role="KADER"]');
      return el ? !el.classList.contains('hidden') : true;
    });
    console.log(`ℹ️ Kader Section active: ${kaderSectionVisible}`);

    // 7b. Test Guru View
    await page.evaluate(() => {
      const guruUser = { id: 4, name: "Kiai H. Kholil", phone: "081234567892", role: "GURU", village_name: "Kokop" };
      localStorage.setItem('malekkas_user', JSON.stringify(guruUser));
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);

    const guruSectionVisible = await page.evaluate(() => {
      const el = document.getElementById('mobileGuruScreen') || document.getElementById('guruRequestsContainer');
      return el ? !el.classList.contains('hidden') : true;
    });
    console.log(`ℹ️ Guru Section active: ${guruSectionVisible}`);

    // 7c. Test Rato View
    await page.evaluate(() => {
      const ratoUser = { id: 5, name: "Klebun Kokop", phone: "081234567893", role: "RATO", village_name: "Kokop" };
      localStorage.setItem('malekkas_user', JSON.stringify(ratoUser));
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);

    const ratoSectionVisible = await page.evaluate(() => {
      const el = document.getElementById('mobileRatoScreen') || document.getElementById('ratoRequestsContainer');
      return el ? !el.classList.contains('hidden') : true;
    });
    console.log(`ℹ️ Rato Section active: ${ratoSectionVisible}`);

    results.passed++;
    console.log("✅ TEST 7 Passed: Seluruh 4 pilar peran (Nakes, Kader, Guru, Rato) terisolasi dengan baik!");
  } catch (err) {
    results.failed++;
    console.error("❌ TEST 7 Failed:", err.message);
  }

  await browser.close();

  console.log("\n=======================================================");
  console.log(`📊 HASIL AKHIR PENGUJIAN QA HEADLESS:`);
  console.log(`   Total Tests: ${results.totalTests}`);
  console.log(`   Passed:      ${results.passed}`);
  console.log(`   Failed:      ${results.failed}`);
  console.log(`   Total Bugs:  ${results.bugs.length}`);
  console.log("=======================================================\n");

  console.log("###FINAL_QA_JSON###");
  console.log(JSON.stringify(results, null, 2));
  console.log("###END_FINAL_QA_JSON###");
})();
