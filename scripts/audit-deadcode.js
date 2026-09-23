const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Ekstrak nama fungsi
const fnRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
let match;
const funcs = new Set();
while ((match = fnRegex.exec(html)) !== null) {
  funcs.add(match[1]);
}

const unused = [];
for (const fn of funcs) {
  const count = (html.match(new RegExp('\\b' + fn + '\\b', 'g')) || []).length;
  if (count <= 1) {
    unused.push({ fn, count });
  }
}

console.log('Total fungsi terdeteksi:', funcs.size);
console.log('Kandidat Dead Functions (count <= 1):', unused);
