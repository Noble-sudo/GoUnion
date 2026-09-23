const fs = require('fs');
let content = fs.readFileSync('backend/src/models.js', 'utf8');

content = content.replace(
  /\{ unique: true, partialFilterExpression: \{ identifier: \{ \$type: "string", \$ne: null \} \} \}/,
  `{ unique: true, partialFilterExpression: { identifier: { $type: "string" } } }`
);

fs.writeFileSync('backend/src/models.js', content);
console.log('Fixed models.js index');
