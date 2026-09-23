const fs = require('fs');
let c = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

c = c.replace(
    /const isAssigned = Boolean\(user\.institution_id\) \|\| user\.role === 'admin' \|\| user\.role === 'moderator' \|\| user\.email\?\.includes\('ezeilodavid292'\);\s*const matchesInst = institutionFilter === 'All' \|\| user\.institution_id === institutionFilter;\s*return matchesSearch && matchesRole && matchesStatus && isAssigned && matchesInst;/g,
    "const matchesInst = institutionFilter === 'All' || user.institution_id === institutionFilter;\n          return matchesSearch && matchesRole && matchesStatus && matchesInst;"
);

// We should also make sure they group properly if they are unassigned but not admin.
c = c.replace(
    /if \(user\.role === 'admin' \|\| user\.role === 'moderator' \|\| user\.email\?\.includes\('ezeilodavid292'\)\) \{\s*groupName = 'Platform Admin \/ Staff';\s*\}/g,
    "if (user.role === 'admin' || user.role === 'moderator' || user.email?.includes('ezeilodavid292')) {\n          groupName = 'Platform Admin / Staff';\n        } else if (!user.institution_id) {\n          groupName = 'Unassigned / Pending Verification';\n        }"
);

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', c);
console.log('Removed isAssigned filter');
