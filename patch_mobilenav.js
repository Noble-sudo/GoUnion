import fs from 'fs';

let code = fs.readFileSync('frontend/components/layout/MobileNav.jsx', 'utf8');
code = code.replace(/\{ icon: Compass, label: "Goto", path: "\/goto" \}/g, '{ icon: Compass, label: "Konnect", path: "/konnect" }');
code = code.replace(/if \(location\.pathname === "\/goto" && item\.path === "\/goto"\)/g, 'if (location.pathname === "/konnect" && item.path === "/konnect")');

fs.writeFileSync('frontend/components/layout/MobileNav.jsx', code);
console.log('Patched MobileNav.jsx');
