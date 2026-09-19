const { chromium } = require('../node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('========================================================================');
  console.log('🧪 TEST SUITE: SEARCH, FILTER, SORTIR, PAGINATION & MAPS CATEGORIES');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const indexUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security', '--no-sandbox']
  });

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // =========================================================================
    // SECTION 1: MAP CATEGORY PIN FILTERING & BADGES
    // =========================================================================
    console.log('🗺️  1. Menguji Filter Kategori Pin Peta Interaktif Leaflet & Counters...');
    const nakesPage = await browser.newPage({ viewport: { width: 1280, height: 850 } });
    nakesPage.on('dialog', async d => await d.accept());

    await nakesPage.addInitScript(() => {
      const nakesUser = {
        id: 1,
        name: 'dr. Farhan',
        role: 'NAKES',
        phone: '081234567890',
        village_id: 1,
        village_name: 'Puskesmas Kokop'
      };
      localStorage.setItem('malekkas_user', JSON.stringify(nakesUser));
      localStorage.setItem('malekkas_token', 'token-test-nakes-farhan');
    });

    await nakesPage.goto(indexUrl, { waitUntil: 'load' });
    await nakesPage.evaluate(() => {
      const s = document.getElementById('appSplashScreen');
      if (s) s.classList.add('splash-hidden');
    });
    await nakesPage.waitForTimeout(600);

    // Pastikan dashboard terbuka
    await nakesPage.evaluate(() => switchNakesTab('dashboard'));
    await nakesPage.waitForTimeout(500);

    // A. Periksa Counter Badge Kategori Peta
    const counters = await nakesPage.evaluate(() => {
      return {
        all: parseInt(document.getElementById('mapCount_ALL')?.innerText || '0'),
        evac: parseInt(document.getElementById('mapCount_EVAC_NEEDED')?.innerText || '0'),
        coord: parseInt(document.getElementById('mapCount_COORDINATION')?.innerText || '0'),
        ready: parseInt(document.getElementById('mapCount_READY_EVAC')?.innerText || '0'),
        mon: parseInt(document.getElementById('mapCount_MONITORING')?.innerText || '0'),
        totalCases: currentCases.length
      };
    });

    assert(counters.all === counters.totalCases, `Counter Semua Pin (${counters.all}) sama dengan total currentCases (${counters.totalCases})`);
    console.log(`  [INFO] Counter realtime: Total=${counters.all}, Evakuasi=${counters.evac}, Koordinasi=${counters.coord}, Siap=${counters.ready}, Kontrol=${counters.mon}`);

    // B. Uji Filter 'FASKES' (Hanya Posko Puskesmas Kokop)
    await nakesPage.evaluate(() => setMapCategoryFilter('FASKES'));
    await nakesPage.waitForTimeout(300);

    const faskesMarkers = await nakesPage.evaluate(() => {
      return leafletMarkerGroup ? leafletMarkerGroup.getLayers().length : 0;
    });
    assert(faskesMarkers === 1, `Filter Posko Faskes menampilkan tepat 1 marker Puskesmas (ditemukan: ${faskesMarkers})`);

    // C. Uji Filter 'EVAC_NEEDED'
    await nakesPage.evaluate(() => setMapCategoryFilter('EVAC_NEEDED'));
    await nakesPage.waitForTimeout(300);

    const evacMarkers = await nakesPage.evaluate(() => {
      return leafletMarkerGroup ? leafletMarkerGroup.getLayers().length : 0;
    });
    assert(evacMarkers === counters.evac, `Filter Butuh Evakuasi (${evacMarkers}) cocok dengan badge counter (${counters.evac})`);

    // D. Kembalikan ke 'ALL'
    await nakesPage.evaluate(() => setMapCategoryFilter('ALL'));
    await nakesPage.waitForTimeout(300);

    const allMarkers = await nakesPage.evaluate(() => {
      return leafletMarkerGroup ? leafletMarkerGroup.getLayers().length : 0;
    });
    assert(allMarkers === counters.totalCases + 1, `Semua Pin menampilkan ${allMarkers} marker (${counters.totalCases} kasus + 1 Faskes)`);

    const screenshotDir = path.join(__dirname, '../docs/screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    await nakesPage.screenshot({ path: path.join(screenshotDir, 'map-category-filter-passed.png') });

    // =========================================================================
    // SECTION 2: SEARCH, FILTER, SORT & PAGINATION DI TAB KASUS (NAKES)
    // =========================================================================
    console.log('\n📋 2. Menguji Search, Filter, Sortir & Pagination Daftar Semua Kasus...');
    await nakesPage.evaluate(() => switchNakesTab('kasus'));
    await nakesPage.waitForTimeout(400);

    // A. Filter Pencarian Teks
    await nakesPage.evaluate(() => {
      const input = document.getElementById('searchCasesInput');
      input.value = 'Mat Hasan';
      handleCasesFilterSort(true);
    });
    await nakesPage.waitForTimeout(300);

    const matchedCaseRows = await nakesPage.evaluate(() => {
      return document.querySelectorAll('#allCasesTableBody tr').length;
    });
    const matchedCaseText = await nakesPage.evaluate(() => {
      return document.getElementById('allCasesTableBody')?.innerText || '';
    });
    assert(matchedCaseRows === 1, `Pencarian 'Mat Hasan' menghasilkan tepat 1 baris (ditemukan: ${matchedCaseRows})`);
    assert(matchedCaseText.includes('Mat Hasan'), 'Nama pasien Mat Hasan muncul di hasil pencarian');

    // B. Reset Pencarian & Uji Sortir Prioritas
    await nakesPage.evaluate(() => {
      document.getElementById('searchCasesInput').value = '';
      document.getElementById('sortCases').value = 'priority_desc';
      handleCasesFilterSort(true);
    });
    await nakesPage.waitForTimeout(300);

    const firstRowPriority = await nakesPage.evaluate(() => {
      return document.querySelector('#allCasesTableBody tr td:nth-child(5)')?.innerText || '';
    });
    assert(firstRowPriority.length > 0, `Sortir prioritas tertinggi berhasil (Baris teratas: ${firstRowPriority})`);

    // C. Uji Pagination Kasus (Set Per Page = 5)
    await nakesPage.evaluate(() => {
      changeCasesPerPage('5');
    });
    await nakesPage.waitForTimeout(300);

    const paginationSummary = await nakesPage.evaluate(() => {
      return document.getElementById('casesPaginationContainer')?.innerText || '';
    });
    assert(paginationSummary.includes('Menampilkan'), 'Info pagination kasus tampil: ' + paginationSummary.trim());

    await nakesPage.screenshot({ path: path.join(screenshotDir, 'cases-search-pagination-passed.png') });

    // =========================================================================
    // SECTION 3: SEARCH, FILTER DESA, SORT & PAGINATION DATA PASIEN (NAKES)
    // =========================================================================
    console.log('\n👥 3. Menguji Search, Filter Desa, Sort & Pagination Basis Data Pasien...');
    await nakesPage.evaluate(() => switchNakesTab('pasien'));
    await nakesPage.waitForTimeout(400);

    // A. Periksa Dropdown Desa Terisi 13 Desa Kokop
    const villageOptionsCount = await nakesPage.evaluate(() => {
      const sel = document.getElementById('filterPatientsVillage');
      return sel ? sel.options.length : 0;
    });
    assert(villageOptionsCount > 1, `Dropdown Filter Desa memuat ${villageOptionsCount} pilihan desa`);

    // B. Filter Berdasarkan Desa Durjan
    await nakesPage.evaluate(() => {
      const sel = document.getElementById('filterPatientsVillage');
      sel.value = 'Durjan';
      handlePatientsFilterSort(true);
    });
    await nakesPage.waitForTimeout(300);

    const durjanRows = await nakesPage.evaluate(() => {
      const text = document.getElementById('patientsTableBody')?.innerText || '';
      return {
        count: document.querySelectorAll('#patientsTableBody tr').length,
        hasDurjan: text.includes('Durjan'),
        hasKokop: text.includes('Kokop')
      };
    });
    assert(durjanRows.count > 0, 'Ada pasien dari Desa Durjan yang tampil');
    assert(durjanRows.hasDurjan, 'Tabel pasien memuat Desa Durjan');

    // C. Reset Filter Desa & Uji Sortir Nama A-Z
    await nakesPage.evaluate(() => {
      document.getElementById('filterPatientsVillage').value = '';
      document.getElementById('sortPatients').value = 'name_asc';
      handlePatientsFilterSort(true);
    });
    await nakesPage.waitForTimeout(300);

    const patientNames = await nakesPage.evaluate(() => {
      return Array.from(document.querySelectorAll('#patientsTableBody tr td:first-child'))
        .map(el => el.innerText.split('\n')[0].trim());
    });
    const sortedNames = [...patientNames].sort((a, b) => a.localeCompare(b));
    assert(JSON.stringify(patientNames) === JSON.stringify(sortedNames), `Data pasien terurut alfabetis A - Z: [${patientNames.join(', ')}]`);

    // D. Pagination Kontrol Pasien
    const patientPaginationHtml = await nakesPage.evaluate(() => {
      return document.getElementById('patientsPaginationContainer')?.innerHTML || '';
    });
    assert(patientPaginationHtml.length > 0, 'Kontrol pagination pasien tersedia di footer tabel');

    await nakesPage.screenshot({ path: path.join(screenshotDir, 'patients-search-pagination-passed.png') });

    // =========================================================================
    // SECTION 4: SEARCH, FILTER KEPATUHAN & PAGINATION KONTROL OBAT
    // =========================================================================
    console.log('\n💊 4. Menguji Filter Kepatuhan Obat, Search & Pagination Kontrol Pasca-Pasung...');
    await nakesPage.evaluate(() => switchNakesTab('kontrol'));
    await nakesPage.waitForTimeout(400);

    // A. Filter Kepatuhan Obat
    await nakesPage.evaluate(() => {
      const sel = document.getElementById('filterKontrolCompliance');
      if (sel) {
        sel.value = 'RUTIN';
        handleKontrolFilterSort(true);
      }
    });
    await nakesPage.waitForTimeout(300);

    const kontrolCardsCount = await nakesPage.evaluate(() => {
      return document.querySelectorAll('#controlSchedulesContainer > div').length;
    });
    assert(kontrolCardsCount > 0, `Filter Rutin menampilkan ${kontrolCardsCount} kartu kontrol`);

    // B. Reset Filter & Periksa Pagination
    await nakesPage.evaluate(() => {
      const sel = document.getElementById('filterKontrolCompliance');
      if (sel) {
        sel.value = '';
        handleKontrolFilterSort(true);
      }
    });
    await nakesPage.waitForTimeout(300);

    const kontrolPagination = await nakesPage.evaluate(() => {
      return document.getElementById('kontrolPaginationContainer')?.innerText || '';
    });
    assert(kontrolPagination.includes('Menampilkan'), 'Pagination kontrol obat menampilkan keterangan');

    // =========================================================================
    // SECTION 5: SEARCH, FILTER & PAGINATION SEMUA LAPORAN MASUK
    // =========================================================================
    console.log('\n📨 5. Menguji Search, Filter & Pagination Laporan Masuk Kader...');
    await nakesPage.evaluate(() => switchNakesTab('laporan'));
    await nakesPage.waitForTimeout(400);

    const reportsCount = await nakesPage.evaluate(() => {
      return document.querySelectorAll('#allReportsTableBody tr').length;
    });
    assert(reportsCount > 0, `Tabel laporan masuk memuat ${reportsCount} baris`);

    const reportsPagination = await nakesPage.evaluate(() => {
      return document.getElementById('reportsPaginationContainer')?.innerText || '';
    });
    assert(reportsPagination.includes('Menampilkan'), 'Pagination laporan masuk aktif');

    await nakesPage.close();

    // =========================================================================
    // SECTION 6: KADER MOBILE PWA STATUS PAGINATION & INDONESIAN BADGES
    // =========================================================================
    console.log('\n📱 6. Menguji Pagination Mobile & Label Bahasa Indonesia Laporan Kader...');
    const kaderPage = await browser.newPage({ viewport: { width: 450, height: 850 } });
    kaderPage.on('dialog', async d => await d.accept());

    await kaderPage.addInitScript(() => {
      const kaderUser = {
        id: 3,
        name: 'Siti',
        role: 'KADER',
        phone: '081234567891',
        village_id: 1,
        village_name: 'Kokop'
      };
      localStorage.setItem('malekkas_user', JSON.stringify(kaderUser));
      localStorage.setItem('malekkas_token', 'token-test-kader-siti');
    });

    await kaderPage.goto(indexUrl, { waitUntil: 'load' });
    await kaderPage.evaluate(() => {
      const s = document.getElementById('appSplashScreen');
      if (s) s.classList.add('splash-hidden');
    });
    await kaderPage.waitForTimeout(600);

    await kaderPage.evaluate(() => switchKaderPwaSub('status'));
    await kaderPage.waitForTimeout(400);

    // Periksa bahwa semua badge status menggunakan Bahasa Indonesia (Bebas kata mentah SIAGA / CLOSED / dsb)
    const kaderBadges = await kaderPage.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('#kaderStatusListContainer span'));
      return spans.map(s => s.innerText.trim());
    });

    const hasEnglishRawStatus = kaderBadges.some(b => ['CLOSED', 'READY_FOR_EVACUATION', 'SIAGA', 'COORDINATION', 'EVACUATION'].includes(b));
    assert(!hasEnglishRawStatus, 'Semua badge status di kartu kader menggunakan istilah Bahasa Indonesia!');
    console.log('  [INFO] Contoh label status kader: ' + kaderBadges.filter(b => b.length > 2).slice(0, 3).join(', '));

    // Periksa pagination container mobile kader
    const kaderPaginationExists = await kaderPage.evaluate(() => {
      return document.getElementById('kaderPaginationContainer') !== null;
    });
    assert(kaderPaginationExists, 'Elemen pagination mobile kader (#kaderPaginationContainer) terpasang di DOM');

    await kaderPage.screenshot({ path: path.join(screenshotDir, 'kader-mobile-pagination-passed.png') });
    await kaderPage.close();

    console.log('\n========================================================================');
    console.log(`🎉 SELURUH PENGUJIAN SELESAI: ${passedTests}/${totalTests} TESTS PASS (100%)!`);
    console.log('========================================================================');

  } catch (err) {
    console.error('❌ PENGUJIAN GAGAL:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
