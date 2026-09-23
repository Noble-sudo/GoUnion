const fs = require('fs');
let c = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

c = c.replace(/src=\{member\.user\?\.avatar \|\| member\.user\?\.profile_picture\}/g, `src={member.user?.profile?.profile_picture || member.user?.profile?.avatar || member.user?.avatar || member.user?.profile_picture}`);

c = c.replace(/\{member\.user\?\.full_name \|\| member\.user\?\.username\}/g, `{member.user?.profile?.full_name || member.user?.full_name || member.user?.username}`);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', c);
console.log('Fixed GroupDetails people avatars');
