const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\) : \(\r?\n\s*\{currentUser\?\.blockedUsers\?\.includes/g,
    `) : currentUser?.blockedUsers?.includes`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed brace');
