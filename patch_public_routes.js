const fs = require('fs');

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(
    /const PUBLIC_ROUTES = \[\s*\"\/login\",/g,
    'const PUBLIC_ROUTES = [\n        "/",\n        "/login",'
);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Added / to PUBLIC_ROUTES');
