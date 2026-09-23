import fs from 'fs';
let c = fs.readFileSync('frontend/App.jsx', 'utf8');
c = c.replace(/import \{ Alumni \} from "\.\/pages\/Alumni";/g, '');
c = c.replace(/_jsx\(Route, \{ path: "\/alumni", element: _jsx\(PrivateRoute, \{ children: _jsx\(Alumni, \{\}\) \}\) \}\), /g, '');
fs.writeFileSync('frontend/App.jsx', c);
console.log('Fixed Alumni');
