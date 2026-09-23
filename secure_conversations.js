const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

if (!content.includes('assertSameInstitution')) {
  content = content.replace(
    "import { forbidden, notFound, HttpError } from '../utils/httpError.js';",
    "import { forbidden, notFound, HttpError } from '../utils/httpError.js';\nimport { assertSameInstitution } from '../utils/institutionScope.js';"
  );
  
  const injectCode = `
      const participantIds = Array.from(new Set([req.user.id, ...(req.body.participant_ids || []).map(String)]));
      
      // Ensure all participants belong to the same campus
      const usersToCheck = await User.find({ id: { $in: participantIds } });
      for (const p of usersToCheck) {
        if (p.id !== req.user.id) {
          assertSameInstitution(p, req.user, 'User');
        }
      }
      
      const key = participantKey(participantIds);
`;

  content = content.replace(
    /const participantIds = Array\.from\(new Set\(\[req\.user\.id, \.\.\.\(req\.body\.participant_ids \|\| \[\]\)\.map\(String\)\]\)\);\s*const key = participantKey\(participantIds\);/,
    injectCode
  );
  
  fs.writeFileSync('backend/src/routes/conversations.js', content);
  console.log('Secured conversations.js');
}
