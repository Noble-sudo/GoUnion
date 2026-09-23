import fs from 'fs';

// Remove universityName from Dashboard Mobile and Desktop Header
let dashboard = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');

dashboard = dashboard.replace(
  '<p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{universityName}</p>',
  ''
);
// Replace it globally in Dashboard in case there are multiple
dashboard = dashboard.replace(
  /<p className="text-\[10px\] font-black uppercase tracking-widest text-white\/40 mb-1">\{universityName\}<\/p>/g,
  ''
);

fs.writeFileSync('frontend/pages/Dashboard.jsx', dashboard);
