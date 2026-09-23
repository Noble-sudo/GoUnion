const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\}\)\}\r?\n\s*<\/div>\r?\n\s*<div className="relative flex-1 overflow-y-auto overflow-x-hidden/g,
    `})}\n                          </div>\n                      </header>\n                      <div className="relative flex-1 overflow-y-auto overflow-x-hidden`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Added closing header');
