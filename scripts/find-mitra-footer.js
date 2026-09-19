const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('desktop-footer') || line.includes('Footer Logo')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
