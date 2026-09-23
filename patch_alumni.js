import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(/import \{ Alumni \} from "\.\/pages\/Alumni";/g, '');
c = c.replace(/<Route path="\/alumni" element=\{<PrivateRoute><Alumni \/><\/PrivateRoute>\} \/>/g, '');

fs.writeFileSync('frontend/App.jsx', c);
console.log('Removed Alumni');
