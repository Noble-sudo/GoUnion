const fs = require('fs');

// 1. Update StudentIdentity schema
let modelsContent = fs.readFileSync('backend/src/models.js', 'utf8');
modelsContent = modelsContent.replace(
  /verified_at: \{ type: Date, default: null \},/,
  `verified_at: { type: Date, default: null },
    rejection_reason: { type: String, default: null },`
);
fs.writeFileSync('backend/src/models.js', modelsContent);

// 2. Update store.js to expose rejection_reason
let storeContent = fs.readFileSync('backend/src/store.js', 'utf8');
storeContent = storeContent.replace(
  /verification_status: activeIdentity\?\.status \|\| 'UNVERIFIED',/,
  `verification_status: activeIdentity?.status || 'UNVERIFIED',
      rejection_reason: activeIdentity?.rejection_reason || null,`
);
fs.writeFileSync('backend/src/store.js', storeContent);

// 3. Update adminRouter to accept reason
let adminContent = fs.readFileSync('backend/src/routes/admin.js', 'utf8');
adminContent = adminContent.replace(
  /\} else \{\n\s*identity\.status = 'REJECTED';\n\s*await identity\.save\(\);\n\s*\}/,
  `} else {
      identity.status = 'REJECTED';
      identity.rejection_reason = req.body.reason || 'Your identity verification was rejected. Please submit valid documentation.';
      await identity.save();
    }`
);
fs.writeFileSync('backend/src/routes/admin.js', adminContent);

console.log('Backend rejection reason added');
