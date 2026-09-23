const fs = require('fs');
let c = fs.readFileSync('backend/src/models.js', 'utf8');

c = c.replace(
    /category: \{ type: String, default: 'Other' \},[\s\S]*?creator_id: \{ type: String, required: true, index: true \},/,
    `category: { type: String, default: 'Other' },
    creator_id: { type: String, required: true, index: true },
    institution_id: { type: String, default: null, index: true },`
);

fs.writeFileSync('backend/src/models.js', c);
console.log("Patched models.js");
