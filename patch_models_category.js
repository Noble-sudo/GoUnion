import fs from 'fs';

let content = fs.readFileSync('backend/src/models.js', 'utf8');

content = content.replace(
  "description: { type: String, default: '' },",
  "description: { type: String, default: '' },\n    category: { type: String, default: '' },"
);

fs.writeFileSync('backend/src/models.js', content);
console.log('Added category to groupSchema');
