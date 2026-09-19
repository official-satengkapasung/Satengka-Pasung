const { chromium } = require('playwright-core');
const path = require('path');

async function testBrowserInteractions() {
  console.log('🚀 Menjalankan QA Browser Test E2E...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  // Tangkap dialog & alert otomatis
  page.on('dialog', async dialog => {
    console.log(`[Browser Dialog]:`, dialog.message().slice(0, 100));
    await dialog.accept();
  });

  const loginFilePath = 'file:///' + path.resolve(__dirname, '../login.html').replace(/\\/g, '/');
  const indexFilePath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

  // =========================================================================
  // FASE 1: Login sebagai Kader Jiwa (Bhupa')
  // =========================================================================
  console.log('1️⃣ Membuka Halaman Login:', loginFilePath);
  await page.goto(loginFilePath, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Mengisi akun Kader (Bhupa\')...');
  await page.fill('#loginUsername', '081234567891');
  await page.fill('#loginPassword', 'pass123');
  await page.click('#btnSubmit');
  await page.waitForTimeout(1200);

  // Verifikasi Tampilan Kader (Bhupa')
  const roleBadge = await page.locator('#mobileRoleBadgeTitle').textContent();
  console.log(`✓ Peran aktif: ${roleBadge}`);

  // =========================================================================
  // FASE 2: Kader Membuat Laporan Kasus Baru
  // =========================================================================
  console.log('2️⃣ Membuka form lapor kasus...');
  await page.evaluate(() => switchKaderPwaSub('form'));
  await page.waitForTimeout(400);

  const patientTestName = 'Subur bin Rahman (Audit Real)';
  await page.fill('#kaderFormName', patientTestName);
  await page.fill('#kaderFormAddress', 'Dusun Tlokoh RT 03 RW 01, Desa Kokop');

  console.log('3️⃣ Mengirim laporan temuan...');
  await page.click('#btnKirimMobileLaporan');
  await page.waitForTimeout(1200);

  // Verifikasi laporan masuk di kartu laporan terbaru kader
  const firstReportCardText = await page.locator('#kaderRecentReportsList').textContent();
  if (!firstReportCardText.includes('Subur bin Rahman')) {
    throw new Error('❌ Pasien yang baru dilaporkan tidak terlihat di kartu laporan kader!');
  }
  console.log('✓ Laporan baru BERHASIL tercatat dan muncul di halaman Bhupa\'!');

  // =========================================================================
  // FASE 3: Kader Mengklik Kartu untuk Membuka Detail Laporan
  // =========================================================================
  console.log('4️⃣ Menguji klik kartu laporan untuk membuka detail...');
  await page.locator('#kaderRecentReportsList > div').first().click();
  await page.waitForTimeout(500);

  const isModalDetailVisible = await page.locator('#modalReportDetail').isVisible();
  if (!isModalDetailVisible) {
    throw new Error('❌ Modal detail laporan gagal terbuka saat diklik di halaman kader!');
  }
  const modalPatientName = await page.locator('#repDetailPatientName').textContent();
  console.log(`✓ Modal detail berhasil dibuka untuk pasien: ${modalPatientName}`);

  // Tutup modal detail
  await page.click('button[onclick="closeReportDetail()"]');
  await page.waitForTimeout(300);

  // =========================================================================
  // FASE 4: Beralih Login sebagai Nakes (Puskesmas Kokop)
  // =========================================================================
  console.log('\n5️⃣ Login sebagai Nakes Puskesmas Kokop...');
  await page.goto(loginFilePath, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  await page.fill('#loginUsername', '081234567890');
  await page.fill('#loginPassword', 'pass123');
  await page.click('#btnSubmit');
  await page.waitForTimeout(1200);

  const isViewNakesVisible = await page.locator('#viewNakes').isVisible();
  console.log('Apakah tampilan Nakes aktif:', isViewNakesVisible);

  // Verifikasi Banner Laporan Masuk di Dashboard Nakes
  const bannerPendingText = await page.locator('#nakesPendingReportsList').textContent();
  if (!bannerPendingText.includes('Subur bin Rahman')) {
    throw new Error('❌ Laporan baru tidak ditemukan di banner antrean verifikasi Nakes!');
  }
  console.log('✓ Laporan baru masuk di antrean verifikasi Nakes!');

  // =========================================================================
  // FASE 5: Nakes Membuka Detail Laporan dari Dashboard
  // =========================================================================
  console.log('6️⃣ Menguji tombol Detail di Dashboard Nakes...');
  await page.locator('#nakesPendingReportsList button:has-text("Detail")').first().click();
  await page.waitForTimeout(500);

  const nakesModalDetailVisible = await page.locator('#modalReportDetail').isVisible();
  if (!nakesModalDetailVisible) {
    throw new Error('❌ Modal detail gagal terbuka di dashboard Nakes!');
  }
  console.log('✓ Modal detail laporan berhasil terbuka di Dashboard Nakes!');

  // =========================================================================
  // FASE 6: Nakes Melakukan Validasi EWS dari Modal Detail
  // =========================================================================
  console.log('7️⃣ Menguji tombol Validasi EWS dari Modal Detail...');
  await page.click('#btnRepDetailValidate');
  await page.waitForTimeout(600);

  const isValScreenVisible = await page.locator('#nakesSubValidasi').isVisible();
  if (!isValScreenVisible) {
    throw new Error('❌ Gagal berpindah ke sub-halaman validasi!');
  }

  // =========================================================================
  // FASE 7: Eksekusi Validasi Saja (Tanpa Tokoh)
  // =========================================================================
  console.log('8️⃣ Mengeksekusi tombol "Validasi Saja (Tanpa Tokoh)"...');
  await page.click('button:has-text("Validasi Saja (Tanpa Tokoh)")');
  await page.waitForTimeout(1200);

  // =========================================================================
  // FASE 8: Verifikasi Tabel Laporan & Basis Data Kasus
  // =========================================================================
  console.log('9️⃣ Memeriksa tabel semua laporan...');
  await page.evaluate(() => switchNakesTab('laporan'));
  await page.waitForTimeout(800);

  const tableReportContent = await page.locator('#allReportsTableBody').textContent();
  if (!tableReportContent.includes('Tervalidasi')) {
    throw new Error('❌ Status laporan tidak berubah menjadi Tervalidasi di tabel laporan!');
  }
  console.log('✓ Status laporan sukses tervalidasi di antarmuka Nakes!');

  // Ambil screenshot sebagai bukti verifikasi
  const screenshotPath = path.resolve(__dirname, 'audit-verified-success.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot verifikasi disimpan di: ${screenshotPath}`);

  await browser.close();
  console.log('\n🎉 SEMUA 10 TAHAP PENGUJIAN BROWSER PLAYWRIGHT SUKSES TOTAL 100%!');
}

testBrowserInteractions().catch(err => {
  console.error('\n💥 TEST BROWSER GAGAL:', err);
  process.exit(1);
});
