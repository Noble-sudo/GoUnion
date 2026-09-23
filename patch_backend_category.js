import fs from 'fs';

let content = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

content = content.replace(
  'group.privacy = req.body.privacy ?? group.privacy;',
  'group.privacy = req.body.privacy ?? group.privacy;\n    group.category = req.body.category ?? group.category;'
);

fs.writeFileSync('backend/src/routes/groups.js', content);
console.log('Added category to group update logic');
