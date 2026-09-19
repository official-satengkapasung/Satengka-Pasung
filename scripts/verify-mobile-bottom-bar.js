const { chromium } = require('../node_modules/playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Static Server
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, '..', reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(5500, '127.0.0.1', async () => {
  console.log('Server running for mobile bottom bar test...');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  // Mobile Viewport (iPhone 13/14: 390 x 844)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  try {
    console.log('1. Membuka login.html di mobile viewport (390x844)...');
    await page.goto('http://127.0.0.1:5500/login.html');
    await page.waitForLoadState('networkidle');

    console.log('2. Login sebagai KADER (081234567891)...');
    await page.fill('#loginUsername', '081234567891');
    await page.fill('#loginPassword', 'kader123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/index.html', { timeout: 8000 });
    console.log('   ✅ Sukses masuk ke index.html!');

    // Tunggu splash screen selesai menghilang sempurna
    await page.waitForSelector('#appSplashScreen', { state: 'hidden', timeout: 5000 });
    console.log('   ✅ Splash screen selesai menghilang.');

    await page.waitForSelector('#mobileBottomNavBar', { state: 'visible', timeout: 5000 });
    console.log('   ✅ #mobileBottomNavBar terdeteksi dan terlihat jelas.');

    // Cek posisi awal bottom bar
    const initialBox = await page.locator('#mobileBottomNavBar').boundingBox();
    console.log('   📍 Posisi Awal Bottom Bar:', initialBox);

    // Screenshot state awal
    await page.screenshot({ path: 'scripts/mobile-bottom-bar-initial.png' });
    console.log('   📸 Screenshot awal tersimpan: scripts/mobile-bottom-bar-initial.png');

    // Scroll halaman ke bawah sejauh 600px
    console.log('3. Melakukan scrolling ke bawah sejauh 600px...');
    await page.evaluate(() => {
      window.scrollBy(0, 600);
      const scrollable = document.querySelector('#mobileDeviceFrame .overflow-y-auto');
      if (scrollable) scrollable.scrollBy(0, 600);
    });
    await page.waitForTimeout(1000);

    // Verifikasi apakah bottom bar masih terlihat dan posisinya tetap di bawah viewport
    const scrolledBox = await page.locator('#mobileBottomNavBar').boundingBox();
    console.log('   📍 Posisi Setelah Scroll Bottom Bar:', scrolledBox);

    const isVisibleAfterScroll = await page.locator('#mobileBottomNavBar').isVisible();
    console.log(`   👁️ Visibilitas Setelah Scroll: ${isVisibleAfterScroll}`);

    // Pastikan bottom bar menempel di dasar layar (y + height mendekati 844)
    const isAtBottom = (scrolledBox.y + scrolledBox.height) >= 830;
    console.log(`   🎯 Menempel di Dasar Layar Viewport: ${isAtBottom ? 'YA (PASS)' : 'TIDAK (FAIL)'}`);

    // Screenshot setelah scroll
    await page.screenshot({ path: 'scripts/mobile-bottom-bar-scrolled.png' });
    console.log('   📸 Screenshot setelah scroll tersimpan: scripts/mobile-bottom-bar-scrolled.png');

    if (!isVisibleAfterScroll || !isAtBottom) {
      throw new Error('Bottom bar tidak tetap terlihat di dasar layar saat di-scroll!');
    }

    console.log('\n======================================================');
    console.log('🎉 [TEST PASSED] BOTTOM BAR TETAP FIXED DI MOBILE VIEW!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Uji gagal:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(process.exitCode || 0);
  }
});
