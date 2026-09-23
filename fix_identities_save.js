const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/identities.js', 'utf8');

content = content.replace(
  /if \(\!req\.user\.active_identity_id\) \{\s*req\.user\.active_identity_id = identity\.id;\s*await req\.user\.save\(\);\s*\}/,
  `if (!req.user.active_identity_id || initialStatus === 'VERIFIED') {
        req.user.active_identity_id = identity.id;
        if (initialStatus === 'VERIFIED') {
          req.user.institution_id = identity.institution_id;
        }
        await req.user.save();
      }`
);

fs.writeFileSync('backend/src/routes/identities.js', content);
console.log('Fixed identities.js to save institution_id on auto-verify');
