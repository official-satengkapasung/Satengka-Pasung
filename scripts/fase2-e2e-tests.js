import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const ROLES = [
  { name: 'NAKES', phone: '081234567890', pass: 'satengka123' },
  { name: 'KADER', phone: '081234567891', pass: 'satengka123' },
  { name: 'GHURU', phone: '081234567892', pass: 'satengka123' },
  { name: 'RATO',  phone: '081234567893', pass: 'satengka123' },
];

const results = [];
let browser;

function log(msg) { console.log(`[QA] ${msg}`); }
function addResult(id, name, status, detail, severity = 'info') {
  results.push({ id, name, status, detail, severity });
}

async function loginAs(page, role) {
  await page.goto(`${BASE}/login.html`, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(1500);
  // Dismiss splash if exists
  const splash = page.locator('#appSplashScreen');
  if (await splash.isVisible().catch(() => false)) {
    await splash.click().catch(() => {});
    await page.waitForTimeout(800);
  }
  const phoneInput = page.locator('#loginUsername');
  const passInput = page.locator('#loginPassword');
  const phoneCount = await phoneInput.count();
  if (phoneCount === 0) throw new Error('#loginUsername not found');
  await phoneInput.fill(role.phone);
  await passInput.fill(role.pass);
  await page.locator('#btnLoginSubmit').click();
  await page.waitForTimeout(4000);
  return page.url();
}

async function testLoginAllRoles() {
  log('=== TEST 2.1: Login Flow — All 4 Roles ===');
  for (const role of ROLES) {
    const page = await browser.newPage();
    try {
      const url = await loginAs(page, role);
      const onDashboard = url.includes('index.html') || url === `${BASE}/` || url === `${BASE}`;
      if (onDashboard) {
        // Check if splash dismissed and dashboard visible
        await page.waitForTimeout(1000);
        const bodyText = await page.locator('body').innerText().catch(() => '');
        const hasDashboardContent = bodyText.length > 100;
        addResult(`2.1-${role.name}`, `Login ${role.name}`, 'PASS',
          `Redirected to ${url}, dashboard content: ${hasDashboardContent}`);
      } else {
        // Check for error messages
        const alertText = await page.locator('#alertBox').innerText().catch(() => 'none');
        addResult(`2.1-${role.name}`, `Login ${role.name}`, 'FAIL',
          `Stuck at ${url}, alert: ${alertText}`, 'critical');
      }
    } catch (e) {
      addResult(`2.1-${role.name}`, `Login ${role.name}`, 'FAIL', e.message, 'critical');
    }
    await page.close();
  }
}

async function testLogout() {
  log('=== TEST 2.2: Logout Flow ===');
  const page = await browser.newPage();
  try {
    await loginAs(page, ROLES[0]);
    await page.waitForTimeout(2000);
    // Try multiple logout selectors
    const logoutSelectors = [
      'button:has-text("Keluar")',
      '[onclick*="handleLogout"]',
      '[onclick*="logout"]',
      'a:has-text("Keluar")',
      '.logout-btn'
    ];
    let clicked = false;
    for (const sel of logoutSelectors) {
      const el = page.locator(sel);
      if (await el.count() > 0) {
        await el.first().click();
        clicked = true;
        break;
      }
    }
    if (clicked) {
      await page.waitForTimeout(3000);
      const url = page.url();
      if (url.includes('login.html')) {
        addResult('2.2', 'Logout Flow', 'PASS', `Redirected to: ${url}`);
      } else {
        addResult('2.2', 'Logout Flow', 'WARN', `After logout at: ${url}`, 'moderate');
      }
    } else {
      // Check if handleLogout is available as global function
      const fnAvail = await page.evaluate(() => typeof window.handleLogout === 'function');
      if (fnAvail) {
        await page.evaluate(() => window.handleLogout());
        await page.waitForTimeout(3000);
        addResult('2.2', 'Logout Flow', 'PASS',
          `window.handleLogout() called, now at: ${page.url()}`);
      } else {
        addResult('2.2', 'Logout Flow', 'FAIL', 'No logout button or function found', 'serious');
      }
    }
  } catch (e) {
    addResult('2.2', 'Logout Flow', 'FAIL', e.message, 'serious');
  }
  await page.close();
}

async function testRegisterPage() {
  log('=== TEST 2.3: Register Page — Role Options & Fields ===');
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/register.html`, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    // Dismiss splash if present
    const splash = page.locator('#appSplashScreen');
    if (await splash.isVisible().catch(() => false)) {
      await splash.click().catch(() => {});
      await page.waitForTimeout(800);
    }
    
    // Security check: NAKES role should NOT exist
    const nakesRadio = await page.locator('input[value="NAKES"]').count();
    addResult('2.3-sec', 'Register Security (No NAKES)', nakesRadio === 0 ? 'PASS' : 'FAIL',
      nakesRadio === 0 ? 'NAKES role correctly removed' : 'CRITICAL: NAKES role exposed!',
      nakesRadio > 0 ? 'critical' : 'info');

    // Check 3 community roles
    const kader = await page.locator('input[value="KADER"]').count();
    const guru = await page.locator('input[value="GURU"]').count();
    const rato = await page.locator('input[value="RATO"]').count();
    const allPresent = kader > 0 && guru > 0 && rato > 0;
    addResult('2.3-roles', 'Register Roles (3 Pilar)', allPresent ? 'PASS' : 'FAIL',
      `KADER:${kader} GURU:${guru} RATO:${rato}`,
      allPresent ? 'info' : 'serious');

    // Check form fields with ACTUAL IDs
    const fields = [
      { id: 'regFullName', label: 'Nama Lengkap' },
      { id: 'regPhone', label: 'Nomor WhatsApp' },
      { id: 'regPassword', label: 'Kata Sandi' },
      { id: 'regConfirmPassword', label: 'Ulangi Sandi' },
      { id: 'regVillage', label: 'Wilayah Desa' },
    ];
    for (const f of fields) {
      const count = await page.locator(`#${f.id}`).count();
      addResult(`2.3-${f.id}`, `Register: ${f.label}`, count > 0 ? 'PASS' : 'FAIL',
        `#${f.id} found: ${count > 0}`, count === 0 ? 'serious' : 'info');
    }
  } catch (e) {
    addResult('2.3', 'Register Page', 'FAIL', e.message, 'serious');
  }
  await page.close();
}

async function testKaderReportForm() {
  log('=== TEST 2.4: Kader — Report Form ===');
  const page = await browser.newPage();
  try {
    await loginAs(page, ROLES[1]); // KADER
    await page.waitForTimeout(3000);

    // Check kader form - might need tab activation
    let formFound = await page.locator('#kaderPwaForm').count() > 0;
    if (!formFound) {
      // Try clicking report tab
      const tabs = page.locator('button, [role="tab"]');
      const count = await tabs.count();
      for (let i = 0; i < count; i++) {
        const text = await tabs.nth(i).innerText().catch(() => '');
        if (text.includes('Lapor') || text.includes('Buat') || text.includes('Kirim')) {
          await tabs.nth(i).click();
          await page.waitForTimeout(1000);
          formFound = await page.locator('#kaderPwaForm').count() > 0;
          if (formFound) break;
        }
      }
    }
    addResult('2.4-form', 'Kader Report Form', formFound ? 'PASS' : 'WARN',
      formFound ? '#kaderPwaForm found' : 'Form not found (may need navigation)',
      formFound ? 'info' : 'moderate');

    // Check form field IDs
    if (formFound) {
      const nameField = await page.locator('#kaderFormName').count();
      const villageField = await page.locator('#kaderFormVillage').count();
      const submitBtn = await page.locator('#btnKirimMobileLaporan').count();
      addResult('2.4-fields', 'Kader Form Fields',
        (nameField > 0 || villageField > 0) ? 'PASS' : 'WARN',
        `Name:${nameField} Village:${villageField} Submit:${submitBtn}`,
        (nameField === 0 && villageField === 0) ? 'moderate' : 'info');
    }
  } catch (e) {
    addResult('2.4', 'Kader Report', 'FAIL', e.message, 'serious');
  }
  await page.close();
}

async function testNakesDashboard() {
  log('=== TEST 2.5: Nakes Dashboard ===');
  const page = await browser.newPage();
  try {
    await loginAs(page, ROLES[0]);
    await page.waitForTimeout(3000);

    const map = await page.locator('#nakesLeafletMap').count();
    addResult('2.5-map', 'Nakes Leaflet Map', map > 0 ? 'PASS' : 'FAIL',
      `#nakesLeafletMap: ${map > 0}`, map === 0 ? 'serious' : 'info');

    // Check global functions
    const fns = await page.evaluate(() => ({
      openChat: typeof window.openTherapeuticChatModal === 'function',
      handleLogout: typeof window.handleLogout === 'function',
      renderRole: typeof window.renderRoleInterface === 'function',
    }));
    addResult('2.5-globals', 'Global JS Functions', 
      (fns.openChat && fns.handleLogout) ? 'PASS' : 'WARN',
      `openChat:${fns.openChat} logout:${fns.handleLogout} renderRole:${fns.renderRole}`,
      (!fns.openChat || !fns.handleLogout) ? 'moderate' : 'info');

    // Check if role-specific section visible
    const nakesSection = await page.locator('[id*="nakes"], [class*="nakes"]').count();
    addResult('2.5-section', 'Nakes Section Visible', nakesSection > 0 ? 'PASS' : 'WARN',
      `Nakes-specific elements: ${nakesSection}`, nakesSection === 0 ? 'moderate' : 'info');
  } catch (e) {
    addResult('2.5', 'Nakes Dashboard', 'FAIL', e.message, 'serious');
  }
  await page.close();
}

async function testUserManagement() {
  log('=== TEST 2.6: Nakes — User Management ===');
  const page = await browser.newPage();
  try {
    await loginAs(page, ROLES[0]);
    await page.waitForTimeout(3000);

    // Try clicking management tabs
    const mgmtLabels = ['Kelola', 'Mitra', 'Akun', 'User'];
    let found = false;
    const tabs = page.locator('button, [role="tab"]');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const text = await tabs.nth(i).innerText().catch(() => '');
      for (const label of mgmtLabels) {
        if (text.includes(label)) {
          await tabs.nth(i).click();
          await page.waitForTimeout(1500);
          found = true;
          break;
        }
      }
      if (found) break;
    }
    addResult('2.6', 'User Management Tab', found ? 'PASS' : 'WARN',
      found ? 'Management section accessible' : 'Management tab not found by text search',
      found ? 'info' : 'moderate');
  } catch (e) {
    addResult('2.6', 'User Management', 'FAIL', e.message, 'serious');
  }
  await page.close();
}

async function testChatModal() {
  log('=== TEST 2.7: Therapeutic Chat Modal ===');
  const page = await browser.newPage();
  try {
    await loginAs(page, ROLES[0]);
    await page.waitForTimeout(3000);

    const chatAvail = await page.evaluate(() => typeof window.openTherapeuticChatModal === 'function');
    addResult('2.7-fn', 'Chat Function Exists', chatAvail ? 'PASS' : 'FAIL',
      `window.openTherapeuticChatModal: ${chatAvail}`, chatAvail ? 'info' : 'serious');

    if (chatAvail) {
      // Try to open it
      try {
        await page.evaluate(() => window.openTherapeuticChatModal('test-case-id', 'Test Pasien'));
        await page.waitForTimeout(1500);
        const modalVisible = await page.locator('[id*="chat"], [class*="chat-modal"], .modal').isVisible().catch(() => false);
        addResult('2.7-open', 'Chat Modal Opens', modalVisible ? 'PASS' : 'WARN',
          `Modal visible after call: ${modalVisible}`, modalVisible ? 'info' : 'moderate');
      } catch (e) {
        addResult('2.7-open', 'Chat Modal Opens', 'FAIL', e.message, 'moderate');
      }
    }
  } catch (e) {
    addResult('2.7', 'Chat Modal', 'FAIL', e.message, 'serious');
  }
  await page.close();
}

async function testMobileNavigation() {
  log('=== TEST 2.9: Mobile Navigation Pills ===');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    await loginAs(page, ROLES[1]); // KADER on mobile
    await page.waitForTimeout(3000);

    // Look for bottom nav, pill nav, or mobile-specific nav
    const navSelectors = [
      '.mobile-nav', '[class*="bottom-nav"]', '[class*="pwa-nav"]',
      'nav[class*="fixed"]', '[class*="pill"]', '.nav-pills',
      '[class*="mobile"]'
    ];
    let navFound = false;
    let navDetail = '';
    for (const sel of navSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        navFound = true;
        navDetail = `${sel}: ${count} element(s)`;
        break;
      }
    }
    addResult('2.9', 'Mobile Bottom Nav', navFound ? 'PASS' : 'WARN',
      navFound ? navDetail : 'No mobile nav found via CSS selectors',
      navFound ? 'info' : 'moderate');

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    addResult('2.9-overflow', 'Mobile Horizontal Overflow', !hasOverflow ? 'PASS' : 'FAIL',
      `Horizontal overflow: ${hasOverflow}`, hasOverflow ? 'serious' : 'info');
  } catch (e) {
    addResult('2.9', 'Mobile Nav', 'FAIL', e.message, 'moderate');
  }
  await page.close();
}

async function testPWA() {
  log('=== TEST 2.10: PWA / Service Worker ===');
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/login.html`, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Manifest
    const manifest = await page.locator('link[rel="manifest"]').count();
    addResult('2.10-manifest', 'PWA Manifest', manifest > 0 ? 'PASS' : 'FAIL',
      `<link rel="manifest"> found: ${manifest > 0}`, manifest === 0 ? 'moderate' : 'info');

    // SW API
    const swAPI = await page.evaluate(() => 'serviceWorker' in navigator);
    addResult('2.10-sw', 'Service Worker API', swAPI ? 'PASS' : 'WARN',
      `ServiceWorker API: ${swAPI}`);

    // Theme color meta
    const themeColor = await page.locator('meta[name="theme-color"]').count();
    addResult('2.10-theme', 'PWA Theme Color', themeColor > 0 ? 'PASS' : 'WARN',
      `<meta name="theme-color"> found: ${themeColor > 0}`, 'info');

    // Viewport meta
    const viewport = await page.locator('meta[name="viewport"]').count();
    addResult('2.10-viewport', 'Viewport Meta', viewport > 0 ? 'PASS' : 'FAIL',
      `<meta name="viewport"> found: ${viewport > 0}`, viewport === 0 ? 'serious' : 'info');
  } catch (e) {
    addResult('2.10', 'PWA Check', 'FAIL', e.message, 'moderate');
  }
  await page.close();
}

// === FASE 3: Accessibility Quick Audit ===
async function testAccessibility() {
  log('=== TEST 3: Accessibility Audit ===');
  const page = await browser.newPage();
  try {
    // Test login page accessibility
    await page.goto(`${BASE}/login.html`, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    const splash = page.locator('#appSplashScreen');
    if (await splash.isVisible().catch(() => false)) {
      await splash.click().catch(() => {});
      await page.waitForTimeout(800);
    }

    // 3.1 Check for labels on form inputs
    const inputsWithoutLabel = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="submit"])');
      const issues = [];
      inputs.forEach(inp => {
        const id = inp.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = inp.getAttribute('aria-label');
        const hasPlaceholder = inp.placeholder;
        const parentLabel = inp.closest('label');
        if (!hasLabel && !hasAriaLabel && !parentLabel) {
          issues.push({ id: id || 'no-id', type: inp.type, placeholder: hasPlaceholder || 'none' });
        }
      });
      return issues;
    });
    addResult('3.2-labels', 'Form Labels/ARIA', 
      inputsWithoutLabel.length === 0 ? 'PASS' : 'WARN',
      inputsWithoutLabel.length === 0 ? 'All inputs have labels' : 
        `${inputsWithoutLabel.length} inputs lack proper labels: ${JSON.stringify(inputsWithoutLabel)}`,
      inputsWithoutLabel.length > 0 ? 'moderate' : 'info');

    // 3.3 Check color contrast (basic check - button text vs background)
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      const btn = document.querySelector('#btnLoginSubmit');
      if (btn) {
        const style = getComputedStyle(btn);
        const color = style.color;
        const bg = style.backgroundColor;
        issues.push({ element: '#btnLoginSubmit', color, bg });
      }
      return issues;
    });
    addResult('3.3-contrast', 'Button Contrast Check', 'INFO',
      `Login button styles: ${JSON.stringify(contrastIssues)}`, 'info');

    // 3.4 Check heading hierarchy
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(hs).map(h => ({ tag: h.tagName, text: h.textContent.trim().substring(0, 50) }));
    });
    const h1Count = headings.filter(h => h.tag === 'H1').length;
    addResult('3.4-headings', 'Heading Hierarchy', h1Count === 1 ? 'PASS' : 'WARN',
      `H1 count: ${h1Count}, All headings: ${JSON.stringify(headings)}`,
      h1Count !== 1 ? 'moderate' : 'info');

    // 3.5 Check focus indicators
    const focusStyle = await page.evaluate(() => {
      const btn = document.querySelector('#btnLoginSubmit');
      if (!btn) return 'no button found';
      btn.focus();
      const style = getComputedStyle(btn);
      return { outline: style.outline, boxShadow: style.boxShadow };
    });
    addResult('3.5-focus', 'Focus Indicators', 'INFO',
      `Focus style on button: ${JSON.stringify(focusStyle)}`, 'info');

    // 3.7 Check zoom 200%
    await page.setViewportSize({ width: 640, height: 480 }); // simulates 200% zoom on 1280 screen
    await page.waitForTimeout(500);
    const overflow200 = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    addResult('3.7-zoom', 'Zoom 200% Overflow', !overflow200 ? 'PASS' : 'FAIL',
      `Horizontal overflow at simulated 200% zoom: ${overflow200}`,
      overflow200 ? 'moderate' : 'info');

  } catch (e) {
    addResult('3', 'Accessibility Audit', 'FAIL', e.message, 'serious');
  }
  await page.close();
}

// === FASE 5: Performance Benchmarking ===
async function testPerformance() {
  log('=== TEST 5: Performance Benchmarking ===');
  
  // 5.5 Login page load time
  const page1 = await browser.newPage();
  try {
    const start1 = Date.now();
    await page1.goto(`${BASE}/login.html`, { waitUntil: 'load', timeout: 15000 });
    const loadTime1 = Date.now() - start1;
    addResult('5.5', 'Login Page Load Time', loadTime1 < 2000 ? 'PASS' : 'FAIL',
      `${loadTime1}ms (target < 2000ms)`, loadTime1 >= 2000 ? 'serious' : 'info');
  } catch (e) {
    addResult('5.5', 'Login Page Load', 'FAIL', e.message, 'serious');
  }
  await page1.close();

  // 5.6 Dashboard load time (after login)
  const page2 = await browser.newPage();
  try {
    await loginAs(page2, ROLES[0]);
    const perfMetrics = await page2.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      if (!perf) return null;
      return {
        domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.startTime),
        loadComplete: Math.round(perf.loadEventEnd - perf.startTime),
        responseEnd: Math.round(perf.responseEnd - perf.startTime),
      };
    });
    if (perfMetrics) {
      addResult('5.6', 'Dashboard Load Time', perfMetrics.loadComplete < 3000 ? 'PASS' : 'WARN',
        `DOM: ${perfMetrics.domContentLoaded}ms, Load: ${perfMetrics.loadComplete}ms, Response: ${perfMetrics.responseEnd}ms`,
        perfMetrics.loadComplete >= 3000 ? 'moderate' : 'info');
    } else {
      addResult('5.6', 'Dashboard Load Time', 'INFO', 'Navigation timing not available', 'info');
    }
  } catch (e) {
    addResult('5.6', 'Dashboard Load', 'FAIL', e.message, 'serious');
  }
  await page2.close();

  // 5.4 Check bundle size via resource entries
  const page3 = await browser.newPage();
  try {
    await page3.goto(`${BASE}/login.html`, { waitUntil: 'load', timeout: 15000 });
    await page3.waitForTimeout(2000);
    const resources = await page3.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name.split('/').pop(),
        size: r.transferSize,
        type: r.initiatorType,
      })).filter(r => r.size > 0).sort((a, b) => b.size - a.size).slice(0, 10);
    });
    const totalJS = resources.filter(r => r.name.endsWith('.js')).reduce((s, r) => s + r.size, 0);
    const totalCSS = resources.filter(r => r.name.endsWith('.css')).reduce((s, r) => s + r.size, 0);
    addResult('5.4', 'Bundle Size Analysis', 'INFO',
      `Top resources: ${JSON.stringify(resources)}\nTotal JS: ${(totalJS/1024).toFixed(1)}kB, Total CSS: ${(totalCSS/1024).toFixed(1)}kB`);
  } catch (e) {
    addResult('5.4', 'Bundle Size', 'FAIL', e.message, 'moderate');
  }
  await page3.close();
}

// === MAIN ===
(async () => {
  log('==================================================');
  log(' TESTING DIVISION — FULL 6-PHASE AUTOMATED SUITE ');
  log('==================================================');
  
  browser = await chromium.launch({ headless: true });
  
  try {
    // FASE 2
    log('\n▶ FASE 2: E2E Functional Testing');
    await testLoginAllRoles();
    await testLogout();
    await testRegisterPage();
    await testKaderReportForm();
    await testNakesDashboard();
    await testUserManagement();
    await testChatModal();
    await testMobileNavigation();
    await testPWA();
    
    // FASE 3
    log('\n▶ FASE 3: Accessibility Audit');
    await testAccessibility();
    
    // FASE 5
    log('\n▶ FASE 5: Performance Benchmarking');
    await testPerformance();
    
  } catch (e) {
    log(`FATAL: ${e.message}`);
  }
  
  await browser.close();
  
  // === SUMMARY ===
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const info = results.filter(r => r.status === 'INFO').length;
  
  log('\n╔══════════════════════════════════════════════╗');
  log('║   TESTING DIVISION — CONSOLIDATED RESULTS    ║');
  log('╚══════════════════════════════════════════════╝');
  log(`TOTAL: ${results.length} | ✅ PASS: ${pass} | ❌ FAIL: ${fail} | ⚠️ WARN: ${warn} | ℹ️ INFO: ${info}`);
  log('');
  
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : r.status === 'WARN' ? '⚠️' : 'ℹ️';
    const sev = (r.severity && r.severity !== 'info') ? ` [${r.severity.toUpperCase()}]` : '';
    log(`${icon} ${r.id}: ${r.name} — ${r.status}${sev}`);
    log(`   ${r.detail}`);
  }
  
  // Save results
  const fs = await import('fs');
  fs.writeFileSync('scripts/testing-division-results.json', 
    JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      summary: { total: results.length, pass, fail, warn, info },
      results 
    }, null, 2));
  log('\nResults saved to: scripts/testing-division-results.json');
})();
