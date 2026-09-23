const fs = require('fs');
let content = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');
content = content.replace(
  /Search, Scale\n\} from 'lucide-react';/,
  `Search, Scale, ShieldCheck\n} from 'lucide-react';`
);
fs.writeFileSync('frontend/pages/AdminPanel.jsx', content);
console.log('Fixed ShieldCheck import');
