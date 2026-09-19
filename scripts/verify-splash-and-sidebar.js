const { chromium } = require('../node_modules/playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
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
      res.end('Not Found');
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

const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');

server.listen(5500, '127.0.0.1', async () => {
  console.log('Server ready on 5500...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  try {
    const context = await browser.newContext();
    // Blokir request font online eksternal agar screenshot instan tanpa timeout
    await context.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());

    // 1. Tangkap tampilan Splash Screen (Mobile & Desktop)
    console.log('1. Mengambil screenshot Splash Screen (Mobile 390x844 & Desktop 1920x1080)...');
    const pageSplash = await context.newPage();
    await pageSplash.setViewportSize({ width: 390, height: 844 });
    await pageSplash.goto('http://127.0.0.1:5500/index.html', { waitUntil: 'domcontentloaded' });
    const splashPath = path.join(screenshotsDir, 'splash-screen-layered-mobile.png');
    await pageSplash.screenshot({ path: splashPath, animations: 'disabled' });
    console.log('   📸 Splash mobile screenshot tersimpan:', splashPath);

    // Desktop Splash Screen
    await pageSplash.setViewportSize({ width: 1920, height: 1080 });
    await pageSplash.goto('http://127.0.0.1:5500/index.html', { waitUntil: 'domcontentloaded' });
    const splashDesktopPath = path.join(screenshotsDir, 'splash-screen-layered-desktop.png');
    await pageSplash.screenshot({ path: splashDesktopPath, animations: 'disabled' });
    console.log('   📸 Splash desktop screenshot tersimpan:', splashDesktopPath);
    await pageSplash.close();

    // 2. Tangkap tampilan Side Panel Nakes dengan background batik
    console.log('2. Login Nakes & Mengambil screenshot Side Panel Nakes...');
    const pageNakes = await context.newPage();
    await pageNakes.setViewportSize({ width: 1280, height: 800 });
    await pageNakes.goto('http://127.0.0.1:5500/login.html');
    await pageNakes.waitForSelector('#appSplashScreen', { state: 'hidden', timeout: 5000 });
    await pageNakes.fill('#loginUsername', '081234567890');
    await pageNakes.fill('#loginPassword', 'nakes123');
    await pageNakes.click('button[type="submit"]');
    await pageNakes.waitForURL('**/index.html', { timeout: 8000 });
    await pageNakes.waitForSelector('#appSplashScreen', { state: 'hidden', timeout: 5000 });
    await pageNakes.waitForTimeout(1000);

    const sidebarEl = pageNakes.locator('#nakesSidebar');
    const sidebarPath = path.join(screenshotsDir, 'side-panel-nakes-batik.png');
    await sidebarEl.screenshot({ path: sidebarPath });
    console.log('   📸 Sidebar screenshot tersimpan:', sidebarPath);

    const desktopPath = path.join(screenshotsDir, 'nakes-dashboard-batik-sidebar.png');
    await pageNakes.screenshot({ path: desktopPath });
    console.log('   📸 Desktop screenshot tersimpan:', desktopPath);

    // 3. Tangkap tampilan Mobile Dashboard Nakes (390x844)
    console.log('3. Menguji tampilan Mobile Dashboard Nakes (390x844)...');
    await pageNakes.setViewportSize({ width: 390, height: 844 });
    await pageNakes.waitForTimeout(500);

    const mobileNormalPath = path.join(screenshotsDir, 'nakes-mobile-dashboard-normal.png');
    await pageNakes.screenshot({ path: mobileNormalPath });
    console.log('   📸 Mobile normal dashboard screenshot tersimpan:', mobileNormalPath);

    // 4. Buka Drawer Sidebar di Mobile
    console.log('4. Membuka Drawer Sidebar di Mobile...');
    await pageNakes.evaluate(() => toggleNakesMobileSidebar(true));
    await pageNakes.waitForTimeout(500);

    const mobileDrawerPath = path.join(screenshotsDir, 'nakes-mobile-drawer-open.png');
    await pageNakes.screenshot({ path: mobileDrawerPath });
    console.log('   📸 Mobile drawer open screenshot tersimpan:', mobileDrawerPath);

    console.log('\n✅ Seluruh pengujian visual Splash Screen, Side Panel & Mobile Drawer SUKSES!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(process.exitCode || 0);
  }
});
