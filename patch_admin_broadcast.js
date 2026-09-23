import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/admin.js', 'utf8');

c = c.replace(
    /sender_id: req\.user\.id,(\s*)type: 'broadcast',/g,
    "sender_id: 'system',$1type: 'broadcast',"
);

fs.writeFileSync('backend/src/routes/admin.js', c);
console.log('Patched admin.js broadcast sender_id');
