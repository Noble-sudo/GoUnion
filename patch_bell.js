import fs from 'fs';
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const lucideMatch = c.match(/import \{([^}]+)\} from "lucide-react";/);
if (lucideMatch && !lucideMatch[1].includes('BellOff')) {
    c = c.replace(lucideMatch[0], `import {${lucideMatch[1]}, BellOff} from "lucide-react";`);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log('Imported BellOff');
}
