const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/users.js', 'utf8');

content = content.replace(
  /const \{ username, email, password, full_name, institution_id, institution_name \} = req\.body;/,
  `const { username, email, password, full_name } = req.body;`
);

content = content.replace(
  /const resolvedInstitution = await resolveInstitutionSelection\(\{[\s\S]*?\}\);\n/,
  ``
);

content = content.replace(
  /institution_id: resolvedInstitution\?\.id \|\| null,\n\s*institution_name: resolvedInstitution\?\.name \|\| institution_name \|\| '',/,
  ``
);

// Update PATCH /:id (profile update) to NOT modify institution_id
content = content.replace(
  /if \(req\.body\.institution_id !== undefined\) \{[\s\S]*?\} else if \(req\.body\.university !== undefined\) \{[\s\S]*?\}/,
  `if (req.body.university !== undefined) {
      req.user.profile.university = req.body.university;
    }`
);

fs.writeFileSync('backend/src/routes/users.js', content);
console.log('users.js patched');
