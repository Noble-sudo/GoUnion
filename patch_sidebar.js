import fs from 'fs';
let file = fs.readFileSync('frontend/components/layout/Sidebar.jsx', 'utf8');
file = file.replace(
  '>Reconnected</span>',
  '>GoUnion</span>'
);
fs.writeFileSync('frontend/components/layout/Sidebar.jsx', file);
