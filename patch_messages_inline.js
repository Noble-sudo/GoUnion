const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(/<span className="hidden sm:inline">Forward<\/span>/g, '');
c = c.replace(/<span className="hidden sm:inline">Info<\/span>/g, '');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Removed inline forward/info text');
