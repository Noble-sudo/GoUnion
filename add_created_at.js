const fs = require('fs');
let content = fs.readFileSync('backend/src/store.js', 'utf8');

content = content.replace(
    "role: plain.role,",
    "role: plain.role,\n    created_at: plain.created_at,"
);

fs.writeFileSync('backend/src/store.js', content);
console.log('Added created_at to publicUser in store.js');
