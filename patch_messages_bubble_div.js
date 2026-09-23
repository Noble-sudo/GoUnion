const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const regex = /(<button onClick=\{\(\) => setInfoMessage\(msg\)\} className="hover:text-white transition-colors flex items-center gap-1" title="Message Info">\s*<Info size=\{12\} \/>\s*<\/button>\s*\)\}\s*<\/div>\s*<\/div>)\n(\s*<\/motion\.div>)/;

c = c.replace(regex, '$1\n                                                              </div>\n$2');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Added missing closing div to message bubble');
