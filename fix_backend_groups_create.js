import fs from 'fs';

let content = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

content = content.replace(
  "privacy: req.body.privacy || 'public',",
  "privacy: req.body.privacy || 'public',\n        category: req.body.category || 'Other',"
);

fs.writeFileSync('backend/src/routes/groups.js', content);
console.log('Added category to group creation in backend');
