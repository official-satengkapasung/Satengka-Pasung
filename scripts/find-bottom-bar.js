const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

const terms = ['bottom', 'tabbar', 'nav', 'footer', 'mobile', 'fixed'];
lines.forEach((line, idx) => {
  const lower = line.toLowerCase();
  if ((lower.includes('bottom') && (lower.includes('nav') || lower.includes('bar') || lower.includes('fixed'))) || lower.includes('mobile-bottom') || lower.includes('bottom-bar') || lower.includes('bottomnav')) {
    console.log(`Line ${idx + 1}: ${line.trim().slice(0, 120)}`);
  }
});
