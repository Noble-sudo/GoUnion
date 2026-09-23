const fs = require('fs');
let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(/const getFullUrl = \(url\) => \{/, 'export const getFullUrl = (url) => {');

fs.writeFileSync('frontend/services/api.js', c);
console.log('Exported getFullUrl');
