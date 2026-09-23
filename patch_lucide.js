import fs from 'fs';
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const lucideMatch = c.match(/import \{([^}]+)\} from 'lucide-react';/);
if (!lucideMatch) {
    const lucideMatch2 = c.match(/import \{([^}]+)\} from "lucide-react";/);
    if (lucideMatch2) {
        let imports = lucideMatch2[1];
        ['LogOut', 'Ban', 'User'].forEach(icon => {
            if (!imports.includes(icon)) imports += `, ${icon}`;
        });
        c = c.replace(lucideMatch2[0], `import {${imports}} from "lucide-react";`);
        fs.writeFileSync('frontend/pages/Messages.jsx', c);
        console.log("Patched lucide imports");
    }
}
