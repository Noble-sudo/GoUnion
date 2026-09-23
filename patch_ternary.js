const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /<\/motion\.div>\s*<\/React\.Fragment>/g,
    '</motion.div>\n                                                        )}\n                                                    </React.Fragment>'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed missing ternary closing');
