const fs = require('fs');

let content = fs.readFileSync('frontend/App.jsx', 'utf8');
content = content.replace(
  /if \(\!user\?\.institution_id && user\?\.role !== 'admin' && location\.pathname !== '\/onboarding'\) \{/,
  `if (!user?.institution_id && !['admin', 'moderator'].includes(user?.role) && location.pathname !== '/onboarding') {`
);
fs.writeFileSync('frontend/App.jsx', content);
console.log('Fixed App.jsx for moderators');
