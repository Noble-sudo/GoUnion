import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(/user\.id/g, 'user?.id');
c = c.replace(/msg\.id/g, 'msg?.id');
c = c.replace(/n\.id/g, 'n?.id');

fs.writeFileSync('frontend/App.jsx', c);
console.log("Patched App.jsx");
