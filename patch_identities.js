const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/identities.js', 'utf8');

content = content.replace(
  /const identity = await StudentIdentity\.create\(\{\n\s*user_id: req\.user\.id,\n\s*institution_id,\n\s*identifier: identifier \? identifier\.trim\(\)\.toLowerCase\(\) : null,\n\s*method,\n\s*status: 'PENDING',\n\s*verification_data: verification_data \|\| \{\},\n\s*\}\);/,
  `const identity = await StudentIdentity.create({
        user_id: req.user.id,
        institution_id,
        identifier: identifier ? identifier.trim().toLowerCase() : null,
        method,
        status: 'PENDING',
        verification_data: verification_data || {},
      });
      
      // If the user doesn't have an active identity, set this as their active one (even if pending)
      // This allows them to bypass the onboarding screen and wait for approval.
      if (!req.user.active_identity_id) {
        req.user.active_identity_id = identity.id;
        await req.user.save();
      }`
);

fs.writeFileSync('backend/src/routes/identities.js', content);
console.log('identities.js patched');
