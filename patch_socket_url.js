const fs = require('fs');
let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(
    /let socketUrl = API_URL \|\| 'http:\/\/127\.0\.0\.1:8001';/,
    `let socketUrl = (API_URL || 'http://127.0.0.1:8001').replace(/\\/api$/, '');`
);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Patched socketUrl in App.jsx');
