import fs from 'fs';
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace('LogOut, Ban} from "lucide-react"', 'LogOut, Ban, User} from "lucide-react"');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched User import!");
