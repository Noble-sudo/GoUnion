const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/identities.js', 'utf8');

content = content.replace(
  /\/\/ if \(\!institution\.verification_methods\.includes\(method\)\) \{ throw new HttpError\(400, 'Method not supported\.'\); \} is not supported by this institution\.\`\);\n\s*\}/,
  `// if (!institution.verification_methods.includes(method)) { throw new HttpError(400, 'Method not supported.'); }`
);

fs.writeFileSync('backend/src/routes/identities.js', content);
console.log('Fixed syntax error in identities.js');
