import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

content = content.replace(
  "privacy: data.privacy,\n                cover_image,",
  "privacy: data.privacy,\n                category: data.category,\n                cover_image,"
);
content = content.replace(
  "privacy: data.privacy,\r\n                cover_image,",
  "privacy: data.privacy,\r\n                category: data.category,\r\n                cover_image,"
);

fs.writeFileSync('frontend/services/api.js', content);
console.log('Added category to api.groups.create');
