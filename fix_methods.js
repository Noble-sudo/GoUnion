const fs = require('fs');

// 1. Patch identities.js to match the UI method strings
let idContent = fs.readFileSync('backend/src/routes/identities.js', 'utf8');

idContent = idContent.replace(
  /if \(method === 'email' && identifier\) \{/,
  `if (method === 'institutional_email' && identifier) {`
);

idContent = idContent.replace(
  /\} else if \(method === 'id_card' \|\| method === 'admission_letter'\) \{/,
  `} else if (method === 'manual') {`
);

fs.writeFileSync('backend/src/routes/identities.js', idContent);

// 2. Patch Onboarding.jsx to show both methods by default
let onbContent = fs.readFileSync('frontend/pages/Onboarding.jsx', 'utf8');

onbContent = onbContent.replace(
  /const getMethods = \(\) => selectedInstitution\?\.verification_methods \|\| \['manual'\];/,
  `const getMethods = () => selectedInstitution?.verification_methods || ['institutional_email', 'manual'];`
);

fs.writeFileSync('frontend/pages/Onboarding.jsx', onbContent);

console.log('Fixed verification methods mapping');
