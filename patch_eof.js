const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\};[\s\S]*$/,
    `};\n`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Removed garbage at EOF');
