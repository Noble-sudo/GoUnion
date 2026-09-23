import fs from 'fs';

let content = fs.readFileSync('backend/src/store.js', 'utf8');

content = content.replace(
  'creatorId: String(group.creator_id),',
  'creatorId: String(group.creator_id),\n      category: group.category || "Other",'
);

fs.writeFileSync('backend/src/store.js', content);
console.log('Added category to serializeGroup');
