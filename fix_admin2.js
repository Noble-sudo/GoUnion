const fs = require('fs');
let content = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');
content = content.replace(
  'Search, Scale',
  'Search, Scale, ShieldCheck'
);
fs.writeFileSync('frontend/pages/AdminPanel.jsx', content);
console.log('Fixed ShieldCheck import successfully');
