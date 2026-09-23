const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /<Share size=\{14\} \/>\s*<\/button>/,
    '<Share size={14} /> Forward\n                                                                                  </button>'
);

c = c.replace(
    /<Info size=\{14\} \/>\s*<\/button>/,
    '<Info size={14} /> Message info\n                                                                                      </button>'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Restored text to context menu');
