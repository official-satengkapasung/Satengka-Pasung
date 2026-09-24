const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('role-view') || line.includes('viewNakes') || line.includes('viewMobilePwa')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
