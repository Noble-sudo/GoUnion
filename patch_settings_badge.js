const fs = require('fs');
const file = 'frontend/pages/Settings.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /text-blue-400 uppercase tracking-wider flex items-center gap-1"><Shield size={12} \/> Verified/g,
  'text-primary uppercase tracking-wider flex items-center gap-1 drop-shadow-[0_0_8px_rgba(196,255,14,0.5)]"><Shield size={12} /> Verified'
);

fs.writeFileSync(file, content);
console.log('Patched Settings.jsx badge');
