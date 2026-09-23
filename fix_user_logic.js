const fs = require('fs');
let c = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

c = c.replace(
    /if \(user\.role === 'admin' \|\| user\.role === 'moderator'\) \{/g,
    "if (user.role === 'admin' || user.role === 'moderator' || user.email?.includes('ezeilodavid292')) {"
);

c = c.replace(
    /const isAssigned = Boolean\(user\.institution_id\) \|\| user\.role === 'admin' \|\| user\.role === 'moderator';/g,
    "const isAssigned = Boolean(user.institution_id) || user.role === 'admin' || user.role === 'moderator' || user.email?.includes('ezeilodavid292');"
);

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', c);
console.log('Fixed UserDirectory logic');
