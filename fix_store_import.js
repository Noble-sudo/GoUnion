import fs from 'fs';

let content = fs.readFileSync('backend/src/store.js', 'utf8');

content = content.replace(
  'GroupMember,',
  'GroupMember,\n  GroupRequest,'
);

fs.writeFileSync('backend/src/store.js', content);
console.log('Added GroupRequest to store.js imports');
