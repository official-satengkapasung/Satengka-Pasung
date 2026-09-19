const fs = require('fs');
const path = require('path');

const files = [
  'handover/BERITA_ACARA_SERAH_TERIMA_BAST.md',
  'handover/BATAS_TANGGUNG_JAWAB_DAN_SCOPE_BOUNDARIES.md'
];

const forbidden = ['gratis', 'free tier', 'spark', 'rp 0', '0 rupiah', 'cuma-cuma'];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8').toLowerCase();
  console.log(`Checking ${f}...`);
  forbidden.forEach(word => {
    if (content.includes(word)) {
      console.warn(`  ⚠️ Found "${word}" in ${f}`);
    } else {
      console.log(`  ✅ Clean of "${word}"`);
    }
  });
});
