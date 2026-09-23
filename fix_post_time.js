import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

content = content.replace(
  "timestamp: createdAt ? createdAt.toLocaleDateString() : '',",
  "timestamp: createdAt ? formatTimeAgo(createdAt) : '',"
);

fs.writeFileSync('frontend/services/api.js', content);
console.log('Fixed time formatting for posts in api.js');
