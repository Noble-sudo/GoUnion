const fs = require('fs');
let content = fs.readFileSync('backend/src/utils/institutionScope.js', 'utf8');

const regex = /institution_id: \{ \$in: \[institutionId, null, ''\] \},/;
const replacement = `institution_id: institutionId,`;

content = content.replace(regex, replacement);

fs.writeFileSync('backend/src/utils/institutionScope.js', content);
console.log('Fixed institutionScope isolation');
