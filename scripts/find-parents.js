const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

for (let i = 2300; i >= 180; i--) {
  const line = lines[i];
  if (line.includes('id="') && (line.includes('Frame') || line.includes('Container') || line.includes('App') || line.includes('main') || line.includes('overflow'))) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
}
