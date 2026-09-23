const fs = require('fs');

const file = 'backend/src/models.js';
let content = fs.readFileSync(file, 'utf8');

const target = `      group_id: { type: String, default: null, index: true },`;
const replacement = `      group_id: { type: String, default: null, index: true },\n      institution_id: { type: String, default: null, index: true },`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('Patched models.js');
