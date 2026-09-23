const fs = require('fs');
let content = fs.readFileSync('frontend/services/api.js', 'utf8');

content = content.replace(
  /const transformProfile = \(data, usernameFallback = ''\) => \{([\s\S]*?)return \{([\s\S]*?)id: userData.id \|\| data.user_id \|\| data.id,([\s\S]*?)username,/m,
  `const transformProfile = (data, usernameFallback = '') => {$1return {$2id: userData.id || data.user_id || data.id,$3username,\n        verification_status: userData.verification_status || data.verification_status || 'UNVERIFIED',`
);

fs.writeFileSync('frontend/services/api.js', content);
console.log('Added verification_status to transformProfile');
