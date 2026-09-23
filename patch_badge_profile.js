const fs = require('fs');
const file = 'frontend/pages/Profile.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /bg-blue-500\/20 text-blue-400/g,
  'bg-primary/20 border border-primary/40 text-primary shadow-[0_0_15px_rgba(196,255,14,0.25)]'
);

fs.writeFileSync(file, content);
console.log('Patched Profile.jsx badge');
