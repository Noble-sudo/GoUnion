const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/auth.js', 'utf8');

content = content.replace(
  /const resolvedInstitution = await resolveInstitutionSelection\(\{[\s\S]*?\}\);\n/,
  ``
);

content = content.replace(
  /institution_id: resolvedInstitution\?\.id \|\| null,/,
  ``
);

content = content.replace(
  /profile: \{ full_name: pending\.full_name, university: resolvedInstitution\?\.name \|\| pending\.institution_name \|\| 'University Student' \},/,
  `profile: { full_name: pending.full_name, university: 'University Student' },`
);

fs.writeFileSync('backend/src/routes/auth.js', content);
console.log('auth.js patched');
