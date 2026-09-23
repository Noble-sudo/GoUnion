import fs from 'fs';

// Remove from TopNav
let topNav = fs.readFileSync('frontend/components/layout/TopNav.jsx', 'utf8');
topNav = topNav.replace(
  'className: "font-black text-2xl tracking-tighter text-white", children: "GoUnion"',
  'className: "hidden", children: ""'
);
fs.writeFileSync('frontend/components/layout/TopNav.jsx', topNav);

// Remove from Sidebar
let sidebar = fs.readFileSync('frontend/components/layout/Sidebar.jsx', 'utf8');
sidebar = sidebar.replace(
  '<span className="block text-sm font-black uppercase tracking-[0.18em] text-white">GoUnion</span>',
  ''
);
fs.writeFileSync('frontend/components/layout/Sidebar.jsx', sidebar);
