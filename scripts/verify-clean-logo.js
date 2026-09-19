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
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

server.listen(5500, '127.0.0.1', async () => {
  console.log('Server running on 5500...');
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
    // 1. Uji Tampilan Login (Logo Bersih Tanpa Outline)
    console.log('1. Mengambil screenshot Login Screen (Logo Bersih)...');
    const pageLogin = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await pageLogin.goto('http://127.0.0.1:5500/login.html');
    await pageLogin.waitForSelector('#appSplashScreen', { state: 'hidden', timeout: 5000 });
    await pageLogin.waitForTimeout(500);

    const loginScreenshotPath = path.join(screenshotsDir, 'logo-clean-login-desktop.png');
    await pageLogin.screenshot({ path: loginScreenshotPath });
    console.log('   📸 Tersimpan:', loginScreenshotPath);

    // 2. Uji Tampilan Dashboard Nakes Desktop (Sidebar Logo Bersih)
    console.log('2. Login Nakes & Mengambil screenshot Dashboard Desktop (Sidebar Logo Bersih)...');
    await pageLogin.fill('#loginUsername', '081234567890');
    await pageLogin.fill('#loginPassword', 'nakes123');
    await pageLogin.click('button[type="submit"]');
    await pageLogin.waitForURL('**/index.html', { timeout: 8000 });
    await pageLogin.waitForSelector('#appSplashScreen', { state: 'hidden', timeout: 5000 });
    await pageLogin.waitForTimeout(1000);

    const nakesScreenshotPath = path.join(screenshotsDir, 'logo-clean-nakes-desktop.png');
    await pageLogin.screenshot({ path: nakesScreenshotPath });
    console.log('   📸 Tersimpan:', nakesScreenshotPath);

    // 3. Uji Tampilan Mobile Kader (Topbar & Bottom Bar Bersih)
    console.log('3. Mengambil screenshot Mobile PWA Kader (Topbar Logo Bersih)...');
    const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await pageMobile.goto('http://127.0.0.1:5500/login.html');
    await pageMobile.waitForSelector('#appSplashScreen', { state: 'hidden', timeout: 5000 });
    await pageMobile.fill('#loginUsername', '081234567891');
    await pageMobile.fill('#loginPassword', 'kader123');
    await pageMobile.click('button[type="submit"]');
    await pageMobile.waitForURL('**/index.html', { timeout: 8000 });
    await pageMobile.waitForSelector('#appSplashScreen', { state: 'hidden', timeout: 5000 });
    await pageMobile.waitForTimeout(1000);

    const mobileScreenshotPath = path.join(screenshotsDir, 'logo-clean-mobile-kader.png');
    await pageMobile.screenshot({ path: mobileScreenshotPath });
    console.log('   📸 Tersimpan:', mobileScreenshotPath);

    console.log('\n✅ Seluruh pengujian visual logo selesai dengan sukses!');
  } catch (err) {
    console.error('❌ Error testing clean logo:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(process.exitCode || 0);
  }
});
