const fs = require('fs');

const files = ['index.html', 'login.html', 'register.html'];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`=== Searching in ${file} ===`);
  lines.forEach((line, idx) => {
    if (line.includes('splash-crayon-ring') || line.includes('crayon-sketch-path') || (line.includes('<svg') && line.includes('viewBox="0 0 130 130"'))) {
      console.log(`  Line ${idx + 1}: ${line.trim().slice(0, 100)}`);
    }
  });
});
