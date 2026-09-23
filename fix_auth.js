const fs = require('fs');
let content = fs.readFileSync('backend/src/middleware/auth.js', 'utf8');

content = content.replace(
  /if \(identity && \['VERIFIED', 'LEGACY_UNVERIFIED'\]\.includes\(identity\.status\)\) \{\n\s*req\.user\.institution_id = identity\.institution_id;\n\s*\}/,
  `if (identity && ['VERIFIED', 'LEGACY_UNVERIFIED'].includes(identity.status)) {
        req.user.institution_id = identity.institution_id;
      } else {
        req.user.institution_id = null;
      }`
);

fs.writeFileSync('backend/src/middleware/auth.js', content);
console.log('Fixed auth.js to nullify institution_id for unverified users');
