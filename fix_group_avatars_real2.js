const fs = require('fs');
let c = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

c = c.replace(/member\.user\?\.profile\?\.profile_picture_url/g, "member.user?.profile?.profile_picture ? getFullUrl(member.user.profile.profile_picture) : null");

c = c.replace(/req\.user\?\.profile\?\.profile_picture_url/g, "req.user?.profile?.profile_picture ? getFullUrl(req.user.profile.profile_picture) : null");

fs.writeFileSync('frontend/pages/GroupDetails.jsx', c);
console.log('Fixed GroupDetails people avatars for real this time');
