const fs = require('fs');

let c = fs.readFileSync('frontend/components/layout/TopNav.jsx', 'utf8');

c = c.replace(
    /className: \`relative p-2\.5 transition-all/g,
    `className: \`relative inline-flex p-2.5 transition-all`
);

fs.writeFileSync('frontend/components/layout/TopNav.jsx', c);
console.log('Patched Link className to inline-flex');
