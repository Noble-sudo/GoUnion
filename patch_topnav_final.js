import fs from 'fs';

let topnav = fs.readFileSync('frontend/components/layout/TopNav.jsx', 'utf8');

// The compiled React string for the university badge in TopNav
const topnavStr = '_jsx("span", { className: "text-[10px] font-bold text-[var(--rc-go)] uppercase tracking-widest leading-none", children: user?.university || "Campus ecosystem" })';
topnav = topnav.replace(topnavStr, 'null'); // replace with null in the array

fs.writeFileSync('frontend/components/layout/TopNav.jsx', topnav);
