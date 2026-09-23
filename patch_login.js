const fs = require('fs');

let content = fs.readFileSync('frontend/pages/Login.jsx', 'utf8');

// Update steps array
content = content.replace(
  /const steps = \["Campus", "Identity", "Account", "Security"\];/,
  `const steps = ["Identity", "Account", "Security"];`
);

// Update step logic
content = content.replace(
  /if \(step === 0\) return Boolean\(selectedInstitution \|\| institutionQuery\.trim\(\)\);\n    if \(step === 1\) return fullName\.trim\(\)\.length >= 2 && username\.trim\(\)\.length >= 3;\n    if \(step === 2\) return email\.trim\(\)\.includes\("@"\);/,
  `if (step === 0) return fullName.trim().length >= 2 && username.trim().length >= 3;\n    if (step === 1) return email.trim().includes("@");`
);

// Remove institution logic from signupPayload
content = content.replace(
  /institutionId: selectedInstitution\?\.id \|\| null,\n\s*institutionName,\n/,
  ``
);
content = content.replace(
  /const institutionName = selectedInstitution\?\.name \|\| institutionQuery\.trim\(\);/,
  ``
);

// Fix UI step rendering
content = content.replace(
  /\{isSignup && step === 0 && \([\s\S]*?\)\}/,
  `` // Remove Campus step
);

content = content.replace(
  /\{isSignup && step === 1 && \(/,
  `{isSignup && step === 0 && (`
);

content = content.replace(
  /\{\(!isSignup \|\| step === 2\) && \(/,
  `{(!isSignup || step === 1) && (`
);

content = content.replace(
  /\{\(!isSignup \|\| step === 3\) && \(/,
  `{(!isSignup || step === 2) && (`
);

// Change label "Student email" to just "Email" since we're splitting the flow
content = content.replace(
  /\{isSignup \? "Student email" : "Email or username"\}/,
  `{isSignup ? "Email address" : "Email or username"}`
);

fs.writeFileSync('frontend/pages/Login.jsx', content);
console.log('Login.jsx patched');
