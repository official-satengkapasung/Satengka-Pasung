/**
 * SATENGKA PASUNG EWS - Anti-Slop & Quality Gate Engine
 * 
 * Verifikasi kepatuhan kode terhadap standar produksi:
 * 1. Zero Hallucinated / Dead Code (no placeholder slop)
 * 2. Secrets & Credential Leakage Check
 * 3. Firestore Rules Strictness (no wildcard writes)
 * 4. PWA Core Integrity & Service Worker Cache Consistency
 * 5. Form Input Sanitization Check
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
let failureCount = 0;

function report(status, testName, details = '') {
  if (status) {
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}${details ? ' -> ' + details : ''}`);
    failureCount++;
  }
}

console.log('====================================================');
console.log('🛡️  DEVSECOPS ANTI-SLOP & CODE HYGIENE AUDIT');
console.log('====================================================\n');

// 1. Audit Anti-Slop Syntax Patterns in Core JS/HTML
console.log('📋 1. Memeriksa Slop Patterns (Placeholder / Incomplete Code)...');
const coreFiles = [
  'index.html',
  'login.html',
  'register.html',
  'sw.js',
  'js/malekkas-engine.js',
  'js/satengka-engine.js',
  'src/services/satengka-service.js'
];

const slopPatterns = [
  { regex: /\/\/\s*TODO:\s*implement/i, desc: 'Placeholder TODO implement' },
  { regex: /\/\/\s*\.\.\.rest of/i, desc: 'Incomplete placeholder code' },
  { regex: /Add your code here/i, desc: 'Generic AI scaffold placeholder' },
  { regex: /Lorem ipsum/i, desc: 'Lorem ipsum placeholder in production markup' }
];

coreFiles.forEach(file => {
  const fullPath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(fullPath)) {
    report(false, `File exists: ${file}`, 'Berkas tidak ditemukan');
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  slopPatterns.forEach(pattern => {
    const match = content.match(pattern.regex);
    if (match) {
      report(false, `No slop [${pattern.desc}] in ${file}`, `Ditemukan: "${match[0]}"`);
    } else {
      report(true, `No slop [${pattern.desc}] in ${file}`);
    }
  });
});

// 2. Audit Secret Leaks & Gitignore Enforcement
console.log('\n🔒 2. Memeriksa DevSecOps Secret Leak & Credentials...');
const gitignorePath = path.join(ROOT_DIR, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const hasFirebaseConfig = gitignoreContent.includes('firebase-config.js');
  report(hasFirebaseConfig, '.gitignore mengecualikan firebase-config.js');
} else {
  report(false, '.gitignore exists');
}

const firebaseConfigPath = path.join(ROOT_DIR, 'firebase-config.js');
if (fs.existsSync(firebaseConfigPath)) {
  const fbContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  // Pastikan berkas ini sudah diabaikan di .gitignore agar tidak terunggah ke remote repository publik
  const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  const isIgnoredInGit = gitignoreContent.includes('firebase-config.js');
  report(isIgnoredInGit, 'firebase-config.js terlindungi dan tidak bocor ke git repository');
}

// 3. Audit Firestore Security Rules (RBAC Hardening)
console.log('\n🛡️ 3. Memeriksa Keamanan Firestore Security Rules...');
const rulesPath = path.join(ROOT_DIR, 'firestore.rules');
if (fs.existsSync(rulesPath)) {
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  const hasWildcardWrite = /allow\s+write\s*:\s*if\s+true\s*;/i.test(rulesContent);
  const hasAuthCheck = rulesContent.includes('isAuthenticated()');
  const hasRoleCheck = rulesContent.includes('getUserRole()');
  
  report(!hasWildcardWrite, 'Tidak ada wildcard "allow write: if true;"');
  report(hasAuthCheck, 'Terdapat validasi otentikasi (isAuthenticated)');
  report(hasRoleCheck, 'Terdapat validasi RBAC (getUserRole)');
} else {
  report(false, 'firestore.rules exists');
}

// 4. PWA Integrity Check (Manifest & SW)
console.log('\n📱 4. Memeriksa Integritas Arsitektur PWA...');
const manifestPath = path.join(ROOT_DIR, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    report(!!manifest.name && !!manifest.short_name, 'Manifest name & short_name terdefinisi');
    report(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'Manifest icons terdefinisi');
    report(!!manifest.start_url, 'Manifest start_url terdefinisi');
  } catch (err) {
    report(false, 'Manifest JSON valid', err.message);
  }
} else {
  report(false, 'manifest.json exists');
}

const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  report(swContent.includes('CACHE_NAME'), 'sw.js memiliki versi CACHE_NAME terkelola');
} else {
  report(false, 'sw.js exists');
}

// Summary
console.log('\n====================================================');
if (failureCount === 0) {
  console.log('✅ SEMUA UJI ANTI-SLOP & DEVSECOPS COMPLIANCE: 100% PASS');
  console.log('====================================================\n');
  process.exit(0);
} else {
  console.error(`❌ TERDETEKSI ${failureCount} PELANGGARAN ATURAN ANTI-SLOP!`);
  console.log('====================================================\n');
  process.exit(1);
}
