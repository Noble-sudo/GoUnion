const fs = require('fs');
let content = fs.readFileSync('backend/src/utils/institutionScope.js', 'utf8');

const regex = /\/\/ If the user is a global admin or moderator, do not restrict by campus\.\s*\/\/ They see all posts from all universities\.\s*if \(user && \['admin', 'moderator'\]\.includes\(user\.role\)\) \{\s*return \{ \.\.\.extra \};\s*\}/;

content = content.replace(regex, '');

fs.writeFileSync('backend/src/utils/institutionScope.js', content);
console.log('Removed admin bypass from institutionScopedQuery');
