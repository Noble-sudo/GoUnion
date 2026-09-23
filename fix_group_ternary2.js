const fs = require('fs');
let c = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

c = c.replace(
  "src={member.user?.profile?.profile_picture ? getFullUrl(member.user.profile.profile_picture) : null || `https://ui-avatars.com/api/?name=${member.user?.username}&background=random`}",
  "src={member.user?.profile?.profile_picture ? getFullUrl(member.user.profile.profile_picture) : `https://ui-avatars.com/api/?name=${member.user?.username || 'user'}&background=random`}"
);

c = c.replace(
  "src={req.user?.profile?.profile_picture ? getFullUrl(req.user.profile.profile_picture) : null || `https://ui-avatars.com/api/?name=${req.user?.username}&background=random`}",
  "src={req.user?.profile?.profile_picture ? getFullUrl(req.user.profile.profile_picture) : `https://ui-avatars.com/api/?name=${req.user?.username || 'user'}&background=random`}"
);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', c);
console.log('Fixed GroupDetails ternary properly');
