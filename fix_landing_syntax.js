import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Landing.jsx', 'utf8');

content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');

fs.writeFileSync('frontend/pages/Landing.jsx', content);
console.log('Fixed syntax in Landing.jsx');
