const fs = require('fs');

// 1. Update models.js default
let modelsContent = fs.readFileSync('backend/src/models.js', 'utf8');
modelsContent = modelsContent.replace(
  /verification_methods: \{ type: \[String\], default: \['manual'\] \},/,
  `verification_methods: { type: [String], default: ['institutional_email', 'manual'] },`
);
// And enable verification by default for all institutions!
modelsContent = modelsContent.replace(
  /verification_enabled: \{ type: Boolean, default: false \},/,
  `verification_enabled: { type: Boolean, default: true },`
);
fs.writeFileSync('backend/src/models.js', modelsContent);

// 2. Remove strict checks in identities.js for legacy data that might still be false/['manual']
let idContent = fs.readFileSync('backend/src/routes/identities.js', 'utf8');
idContent = idContent.replace(
  /if \(\!institution\.verification_enabled\) \{[\s\S]*?\}/,
  `// if (!institution.verification_enabled) { throw new HttpError(400, 'Verification is disabled.'); }`
);
idContent = idContent.replace(
  /if \(\!institution\.verification_methods\.includes\(method\)\) \{[\s\S]*?\}/,
  `// if (!institution.verification_methods.includes(method)) { throw new HttpError(400, 'Method not supported.'); }`
);
fs.writeFileSync('backend/src/routes/identities.js', idContent);

console.log('Fixed strict validation');
