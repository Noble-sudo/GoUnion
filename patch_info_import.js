const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /from "lucide-react";/,
    `, Info } from "lucide-react";`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Added Info to lucide-react imports');
