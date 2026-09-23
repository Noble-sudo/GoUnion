import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(/import \{ Goto \} from "\.\/pages\/Goto";/g, 'import { Konnect } from "./pages/Konnect";\nimport { Teaky } from "./pages/Teaky";');
c = c.replace(/<Route path="\/goto" element=\{<PrivateRoute><Goto \/><\/PrivateRoute>\} \/>/g, '<Route path="/konnect" element={<PrivateRoute><Konnect /></PrivateRoute>} />\n<Route path="/teaky" element={<PrivateRoute><Teaky /></PrivateRoute>} />');

fs.writeFileSync('frontend/App.jsx', c);
console.log('Fixed Goto -> Konnect');
