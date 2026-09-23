const fs = require('fs');
let c = fs.readFileSync('frontend/components/admin/CampusManager.jsx', 'utf8');
c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('frontend/components/admin/CampusManager.jsx', c);
console.log('Fixed backslash escapes');
