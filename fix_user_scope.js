const fs = require('fs');

// 1. Update models.js
let modelsContent = fs.readFileSync('backend/src/models.js', 'utf8');
modelsContent = modelsContent.replace(
  /active_identity_id: \{ type: String, default: null, index: true \},/,
  `active_identity_id: { type: String, default: null, index: true },
    institution_id: { type: String, default: null, index: true },`
);
fs.writeFileSync('backend/src/models.js', modelsContent);

// 2. Update search.js to scope user search
let searchContent = fs.readFileSync('backend/src/routes/search.js', 'utf8');
searchContent = searchContent.replace(
  /import \{ Post, User, Group \} from '\.\.\/models\.js';/,
  `import { Post, User, Group } from '../models.js';\nimport { institutionScopedQuery } from '../utils/institutionScope.js';`
);
searchContent = searchContent.replace(
  /const users = await User\.find\(\{\n\s*id: \{ \$ne: req\.user\.id \},\n\s*\$or: \[\{ username: q \}, \{ email: q \}, \{ 'profile\.full_name': q \}\],\n\s*\}\)/,
  `const users = await User.find(institutionScopedQuery(req.user, {
        id: { $ne: req.user.id },
        $or: [{ username: q }, { email: q }, { 'profile.full_name': q }],
      }))`
);
fs.writeFileSync('backend/src/routes/search.js', searchContent);

// 3. Update users.js /suggestions to scope user search properly using institutionScopedQuery
let usersContent = fs.readFileSync('backend/src/routes/users.js', 'utf8');
usersContent = usersContent.replace(
  /const users = await User\.find\(\{\n\s*institution_id: req\.user\.institution_id \|\| \{ \$in: \[null, ''\] \},\n\s*id: \{ \$ne: req\.user\.id \},\n\s*\}\)/,
  `const users = await User.find(institutionScopedQuery(req.user, {
        id: { $ne: req.user.id },
      }))`
);
fs.writeFileSync('backend/src/routes/users.js', usersContent);

// 4. Update auth.js middleware to set user.institution_id on the user document in memory
// Actually, auth.js ALREADY does this!
// \`req.user.institution_id = identity.institution_id;\`
// But we should also ensure that when active_identity_id changes, the DB is updated.

// 5. Update identities.js change-campus and admin approve to sync institution_id
let idContent = fs.readFileSync('backend/src/routes/identities.js', 'utf8');
idContent = idContent.replace(
  /req\.user\.active_identity_id = identity\.id;\n\s*await req\.user\.save\(\);/g,
  `req.user.active_identity_id = identity.id;
      req.user.institution_id = identity.institution_id;
      await req.user.save();`
);
fs.writeFileSync('backend/src/routes/identities.js', idContent);

let adminContent = fs.readFileSync('backend/src/routes/admin.js', 'utf8');
adminContent = adminContent.replace(
  /user\.active_identity_id = identity\.id;\n\s*await user\.save\(\);/g,
  `user.active_identity_id = identity.id;
      user.institution_id = identity.institution_id;
      await user.save();`
);
fs.writeFileSync('backend/src/routes/admin.js', adminContent);

console.log('Fixed User scoping and denormalized institution_id');
