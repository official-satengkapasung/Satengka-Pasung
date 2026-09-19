const path = require('path');
const fs = require('fs');
const { chromium } = require('../node_modules/playwright-core');

(async () => {
  console.log('Menyiapkan proses cetak PDF dokumen panduan klien...');
  
  const htmlPath = path.resolve(__dirname, '../handover/PANDUAN_PENGGUNAAN_APLIKASI_KLIEN.html');
  const pdfPath = path.resolve(__dirname, '../handover/PANDUAN_PENGGUNAAN_APLIKASI_KLIEN.pdf');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
  } catch (err) {
    console.warn('Chrome default gagal, mencoba fallback launch:', err.message);
    browser = await chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  
  console.log('Memuat dokumen HTML:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  console.log('Menghasilkan file PDF standar A4...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm'
    }
  });

  await browser.close();
  
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`✅ BERHASIL: File PDF terbentuk di ${pdfPath} (${stats.size} bytes)`);
  } else {
    console.error('❌ GAGAL: File PDF tidak ditemukan.');
    process.exit(1);
  }
})();
