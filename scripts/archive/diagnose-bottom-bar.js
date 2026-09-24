const { chromium } = require('../node_modules/playwright-core');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:5500/login.html');
  await page.fill('#loginUsername', '081234567891');
  await page.fill('#loginPassword', 'kader123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/index.html');

  const diagnostic = await page.evaluate(() => {
    const nav = document.getElementById('mobileBottomNavBar');
    const rect = nav.getBoundingClientRect();
    const style = window.getComputedStyle(nav);

    // Cari ancestor yang memiliki transform, filter, will-change, atau contain
    let parent = nav.parentElement;
    const ancestors = [];
    while (parent && parent !== document.body) {
      const pStyle = window.getComputedStyle(parent);
      const isContainingBlock = pStyle.transform !== 'none' ||
                                pStyle.perspective !== 'none' ||
                                pStyle.filter !== 'none' ||
                                pStyle.willChange.includes('transform');
      ancestors.push({
        tag: parent.tagName,
        id: parent.id,
        className: parent.className,
        transform: pStyle.transform,
        filter: pStyle.filter,
        isContainingBlock
      });
      parent = parent.parentElement;
    }

    return {
      windowHeight: window.innerHeight,
      rect,
      position: style.position,
      bottom: style.bottom,
      ancestors
    };
  });

  console.log('Diagnostic:', JSON.stringify(diagnostic, null, 2));
  await browser.close();
  process.exit(0);
})();
