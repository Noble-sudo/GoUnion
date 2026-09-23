import fs from 'fs';
let content = fs.readFileSync('frontend/services/api.js', 'utf8');

content = content.replace(
  "category: g.category || 'Other',\n              });",
  "category: g.category || 'Other',\n              }));"
);

content = content.replace(
  "category: g.category || 'Other',\r\n              });",
  "category: g.category || 'Other',\r\n              }));"
);

fs.writeFileSync('frontend/services/api.js', content);
