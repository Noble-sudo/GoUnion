const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\} , Info \} from "lucide-react";/,
    `, Info } from "lucide-react";`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed Info import syntax');
