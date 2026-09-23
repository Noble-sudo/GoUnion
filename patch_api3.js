import fs from 'fs';

let apiCode = fs.readFileSync('frontend/services/api.js', 'utf8');

apiCode = apiCode.replace(
  'isJoined: g.is_joined ?? g.isJoined ?? false,\n                  privacy: g.privacy,',
  'isJoined: g.is_joined ?? g.isJoined ?? false,\n                  privacy: g.privacy,\n                  category: g.category || "Academic",'
);

fs.writeFileSync('frontend/services/api.js', apiCode);
console.log('Patched api.js for category mapping');
