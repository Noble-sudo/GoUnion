const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const regex = /(return <CheckCheck size=\{14\} className="text-\[\#3b82f6\] ml-1" \/>;\s*\n\s*\}\)\(\)\s*\n\s*\)\}\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*)(<\/motion\.div>)/;

c = c.replace(regex, '$1</div>\n                                                          $2');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Added final missing closing div');
