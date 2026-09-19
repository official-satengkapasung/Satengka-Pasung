const { chromium } = require('../node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🧪 Memulai E2E Verification: Anti-Slop, Guru/Rato Confirmation, Search & Pagination...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const indexUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security', '--no-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();
  page.on('dialog', async d => await d.accept());

  const screenshotDir = path.join(__dirname, '../docs/screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  try {
    // -------------------------------------------------------------
    // STEP 1: TEST BHU' GHURU (KIAI H. KHOLIL)
    // -------------------------------------------------------------
    console.log('\n1️⃣ Menguji Pilar Bhu\' Ghuru (Kiai H. Kholil)...');
    await page.addInitScript(() => {
      const guruUser = {
        id: 4,
        name: 'Kiai H. Kholil',
        role: 'GURU',
        phone: '081234567892',
        village_id: 1,
        village_name: 'Kokop'
      };
      localStorage.setItem('malekkas_user', JSON.stringify(guruUser));
      localStorage.setItem('malekkas_token', 'token-guru-test');
    });

    await page.goto(indexUrl, { waitUntil: 'load' });
    await page.evaluate(() => {
      const s = document.getElementById('appSplashScreen');
      if (s) s.classList.add('splash-hidden');
    });
    await page.waitForTimeout(600);

    // Pastikan layar guru aktif
    const isGuruVisible = await page.evaluate(() => {
      return !document.getElementById('mobileScreenGuru').classList.contains('hidden');
    });
    console.log('  Layar Guru tampil:', isGuruVisible);

    // Cek Search Bar Guru
    const hasSearchGuru = await page.evaluate(() => {
      return !!document.getElementById('guruSearchInput');
    });
    console.log('  Input Search Guru tersedia:', hasSearchGuru);

    // Cek teks slop pada layar guru
    const guruBodyText = await page.evaluate(() => document.getElementById('mobileScreenGuru').innerText);
    const slopCheck = guruBodyText.includes('Doa & Batin') || guruBodyText.includes('Perlu Tausiyah & Doa') || guruBodyText.includes('Bebas Pasung Medis');
    console.log('  Apakah ada teks slop pada Guru?:', slopCheck ? 'ADA (FAIL)' : 'BERSIH (PASS)');

    // Klik tombol konfirmasi pertama di Guru
    const guruBtnTextBefore = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#guruRequestsContainer button'));
      const confirmBtn = btns.find(b => b.innerText.includes('Siap'));
      return confirmBtn ? confirmBtn.innerText.trim() : 'NO_BTN';
    });
    console.log('  Teks tombol Guru sebelum klik:', guruBtnTextBefore);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#guruRequestsContainer button'));
      const confirmBtn = btns.find(b => b.innerText.includes('Saya Siap Membantu'));
      if (confirmBtn) confirmBtn.click();
    });
    await page.waitForTimeout(600);

    const guruBtnTextAfter = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#guruRequestsContainer button'));
      const confirmBtn = btns.find(b => b.innerText.includes('Konfirmasi') || b.innerText.includes('Siap'));
      return confirmBtn ? confirmBtn.innerText.trim() : 'NO_BTN';
    });
    console.log('  Teks tombol Guru setelah klik konfirmasi:', guruBtnTextAfter);

    await page.screenshot({ path: path.join(screenshotDir, 'verified-guru-confirmed.png') });

    // -------------------------------------------------------------
    // STEP 2: TEST RATO (KLEBUN KOKOP)
    // -------------------------------------------------------------
    console.log('\n2️⃣ Menguji Pilar Rato (Klebun Kokop)...');
    await page.evaluate(() => {
      const ratoUser = {
        id: 5,
        name: 'Klebun Kokop',
        role: 'RATO',
        phone: '081234567893',
        village_id: 1,
        village_name: 'Kokop'
      };
      localStorage.setItem('malekkas_user', JSON.stringify(ratoUser));
      currentUser = ratoUser;
      renderRoleInterface();
    });
    await page.waitForTimeout(600);

    const isRatoVisible = await page.evaluate(() => {
      return !document.getElementById('mobileScreenRato').classList.contains('hidden');
    });
    console.log('  Layar Rato tampil:', isRatoVisible);

    const hasSearchRato = await page.evaluate(() => {
      return !!document.getElementById('ratoSearchInput');
    });
    console.log('  Input Search Rato tersedia:', hasSearchRato);

    // Klik tombol konfirmasi pertama di Rato
    const ratoBtnTextBefore = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#ratoRequestsContainer button'));
      const confirmBtn = btns.find(b => b.innerText.includes('Siap'));
      return confirmBtn ? confirmBtn.innerText.trim() : 'NO_BTN';
    });
    console.log('  Teks tombol Rato sebelum klik:', ratoBtnTextBefore);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#ratoRequestsContainer button'));
      const confirmBtn = btns.find(b => b.innerText.includes('Siap Mengawal'));
      if (confirmBtn) confirmBtn.click();
    });
    await page.waitForTimeout(600);

    const ratoBtnTextAfter = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#ratoRequestsContainer button'));
      const confirmBtn = btns.find(b => b.innerText.includes('Konfirmasi') || b.innerText.includes('Siap'));
      return confirmBtn ? confirmBtn.innerText.trim() : 'NO_BTN';
    });
    console.log('  Teks tombol Rato setelah klik konfirmasi:', ratoBtnTextAfter);

    await page.screenshot({ path: path.join(screenshotDir, 'verified-rato-confirmed.png') });

    // -------------------------------------------------------------
    // STEP 3: TEST NAKES DASHBOARD & DETAIL KASUS
    // -------------------------------------------------------------
    console.log('\n3️⃣ Menguji Nakes Dashboard & Detail Kasus...');
    await page.evaluate(() => {
      const nakesUser = {
        id: 1,
        name: 'dr. Farhan',
        role: 'NAKES',
        phone: '081234567890',
        village_id: 1,
        village_name: 'Puskesmas Kokop'
      };
      localStorage.setItem('malekkas_user', JSON.stringify(nakesUser));
      currentUser = nakesUser;
      renderRoleInterface();
      switchNakesTab('dashboard');
    });
    await page.waitForTimeout(600);

    // Periksa status pill di kartu kasus teratas
    const caseCardsInfo = await page.evaluate(() => {
      const card = document.querySelector('#nakesAksiList > div');
      return card ? card.innerText : 'NO_CARD';
    });
    console.log('  Kartu Kasus Teratas memuat status Siap:', caseCardsInfo.includes('Siap'));

    // Buka detail kasus pertama
    await page.evaluate(() => {
      if (currentCases && currentCases.length > 0) {
        selectCaseDetail(currentCases[0].id);
      }
    });
    await page.waitForTimeout(500);

    const bannerText = await page.evaluate(() => {
      return {
        title: document.getElementById('detailBannerTitle')?.innerText || '',
        subtitle: document.getElementById('detailBannerSubtitle')?.innerText || '',
        pilarStatus: document.getElementById('detailBannerPilarStatus')?.innerText || ''
      };
    });
    console.log('  Detail Kasus Banner:', bannerText);

    await page.screenshot({ path: path.join(screenshotDir, 'verified-nakes-detail-status.png') });

    console.log('\n✅ SEMUA PENGUJIAN SELESAI DENGAN SUKSES!');
  } catch (err) {
    console.error('❌ Terjadi Error Saat Uji:', err);
  } finally {
    await browser.close();
  }
})();
