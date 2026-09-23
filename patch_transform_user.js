const fs = require('fs');

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

content = content.replace(
  /university: profile\.university \|\| user\.university \|\| 'University Student',/,
  `university: profile.university || user.university || 'University Student',
        institution_id: user.institution_id || null,
        verification_status: user.verification_status || 'UNVERIFIED',`
);

fs.writeFileSync('frontend/services/api.js', content);
console.log('transformUser patched.');
