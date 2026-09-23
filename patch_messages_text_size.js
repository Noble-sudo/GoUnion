const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /"text-sm text-white\/90"/g,
    '"text-[15px] text-white/95"'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Bumped message text size');
