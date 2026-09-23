const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /<\/div>\n\s*<\/motion\.div>/g,
    '</div>\n                                                              </div>\n                                                          </motion.div>'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Added closing div');
