const fs = require('fs');

let c = fs.readFileSync('backend/src/models.js', 'utf8');

c = c.replace(
    /privacy: \{ type: String, enum: \['public', 'private', 'secret'\], default: 'public' \},/,
    "privacy: { type: String, enum: ['public', 'private', 'secret'], default: 'public' },\n      category: { type: String, default: 'Other' },"
);

fs.writeFileSync('backend/src/models.js', c);
console.log('Patched models.js for category');
