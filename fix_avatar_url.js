const fs = require('fs');

let c = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

if (!c.includes('import { api, getFullUrl }')) {
  c = c.replace(/import \{ api \} from "\.\.\/services\/api";/, `import { api, getFullUrl } from "../services/api";`);
}

c = c.replace(/src=\{member\.user\?\.profile\?\.profile_picture \|\| member\.user\?\.profile\?\.avatar \|\| member\.user\?\.avatar \|\| member\.user\?\.profile_picture\}/g, `src={getFullUrl(member.user?.profile?.profile_picture || member.user?.profile?.avatar || member.user?.avatar || member.user?.profile_picture)}`);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', c);
console.log('Fixed GroupDetails Avatar src');
