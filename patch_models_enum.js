import fs from 'fs';

let c = fs.readFileSync('backend/src/models.js', 'utf8');

c = c.replace(
    /enum: \['pending', 'resolved'\]/g,
    "enum: ['pending', 'resolved', 'ignored', 'dismissed']"
);

fs.writeFileSync('backend/src/models.js', c);
console.log('Fixed Report status enum');
