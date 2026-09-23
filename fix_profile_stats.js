import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

content = content.replace(
  '{user.followers_count || 0}',
  '{user.followers || 0}'
);
content = content.replace(
  '{user.total_likes || 0}',
  '{user.totalLikes || 0}'
);

fs.writeFileSync('frontend/pages/Profile.jsx', content);
console.log('Fixed profile stats keys in Profile.jsx');
