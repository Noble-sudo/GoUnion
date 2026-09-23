const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/profiles.js', 'utf8');

if (!content.includes('assertSameInstitution')) {
  content = content.replace(
    "import { notFound } from '../utils/httpError.js';",
    "import { notFound } from '../utils/httpError.js';\nimport { assertSameInstitution } from '../utils/institutionScope.js';"
  );
  
  content = content.replace(
    "if (!user) throw notFound('Profile not found.');",
    "if (!user) throw notFound('Profile not found.');\n    assertSameInstitution(user, req.user, 'Profile');"
  );
  
  fs.writeFileSync('backend/src/routes/profiles.js', content);
  console.log('Secured profiles.js');
}
