const fs = require('fs');
let c = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

c = c.replace(/src=\{member\.user\?\.profile\?\.profile_picture_url \|\| \\\`https:\/\/ui-avatars\.com\/api\/\?name=\\\$\\{member\.user\?\.username\\}&background=random\\\`\}/g, `src={member.user?.profile?.profile_picture ? getFullUrl(member.user.profile.profile_picture) : \`https://ui-avatars.com/api/?name=\${member.user?.username}&background=random\`}`);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', c);
console.log('Fixed GroupDetails people avatars for real');
