import fs from 'fs';

let c = fs.readFileSync('backend/src/models.js', 'utf8');

c = c.replace(
    'is_deleted: { type: Boolean, default: false },',
    'is_deleted: { type: Boolean, default: false },\n    is_forwarded: { type: Boolean, default: false },'
);

fs.writeFileSync('backend/src/models.js', c);
console.log("Patched models.js");
