const fs = require('fs');
let c = fs.readFileSync('frontend/components/layout/TopNav.jsx', 'utf8');

c = c.replace(
    /_jsxs\("button", \{ onClick: \(\) => navigate\('\/notifications'\), className/g,
    `_jsxs(Link, { to: '/notifications', className`
);

fs.writeFileSync('frontend/components/layout/TopNav.jsx', c);
console.log('Changed TopNav bell to Link');
