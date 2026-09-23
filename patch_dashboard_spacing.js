import fs from 'fs';

let dashboard = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');

dashboard = dashboard.replace(
  '<div className="px-5 sm:px-8 py-8 md:py-10 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl sticky top-0 z-40 hidden md:block">',
  '<div className="px-5 sm:px-8 pt-8 pb-3 md:pt-10 md:pb-3 bg-[#030303]/80 backdrop-blur-xl sticky top-0 z-40 hidden md:block">'
);

dashboard = dashboard.replace(
  '<div className="px-5 py-6 block md:hidden">',
  '<div className="px-5 pt-6 pb-2 block md:hidden">'
);

dashboard = dashboard.replace(
  '<div className="px-5 sm:px-0 mb-6 mt-4">',
  '<div className="px-5 sm:px-0 mb-6 mt-0">'
);

fs.writeFileSync('frontend/pages/Dashboard.jsx', dashboard);
