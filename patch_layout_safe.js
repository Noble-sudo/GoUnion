import fs from 'fs';

let c = fs.readFileSync('frontend/components/layout/RightSidebar.jsx', 'utf8');
c = c.replace(/u\.id/g, 'u?.id');
c = c.replace(/group\.id/g, 'group?.id');
fs.writeFileSync('frontend/components/layout/RightSidebar.jsx', c);

let d = fs.readFileSync('frontend/components/layout/TopNav.jsx', 'utf8');
d = d.replace(/user\.id/g, 'user?.id');
d = d.replace(/group\.id/g, 'group?.id');
d = d.replace(/post\.id/g, 'post?.id');
fs.writeFileSync('frontend/components/layout/TopNav.jsx', d);

console.log("Patched RightSidebar and TopNav");
