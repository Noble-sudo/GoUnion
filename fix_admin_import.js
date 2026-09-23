const fs = require('fs');
let content = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');

content = content.replace(
  /import VerificationQueue from '\.\.\/components\/admin\/VerificationQueue';/,
  `import { VerificationQueue } from '../components/admin/VerificationQueue';`
);

fs.writeFileSync('frontend/pages/AdminPanel.jsx', content);
console.log('Fixed VerificationQueue import');
