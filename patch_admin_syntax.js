import fs from 'fs';

let c = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');

c = c.replace(/className=\{\\\`/g, 'className={`');
c = c.replace(/\\\\\$\{/g, '${');
c = c.replace(/\\\\\`/g, '`');
c = c.replace(/\\\`/g, '`');
c = c.replace(/\\\$/g, '$');

fs.writeFileSync('frontend/pages/AdminPanel.jsx', c);
console.log('Fixed syntax error in AdminPanel!');
