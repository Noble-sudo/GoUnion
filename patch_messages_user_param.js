const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
  'const userIdFromQuery = searchParams.get("userId");',
  'const userIdFromQuery = searchParams.get("userId") || searchParams.get("user");'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched Messages.jsx');
