import fs from 'fs';

let css = fs.readFileSync('frontend/global.css', 'utf8');

const regex = /body:has\(video\)::after\s*\{[^}]+\}/g;
css = css.replace(regex, '');

fs.writeFileSync('frontend/global.css', css);

let dashboard = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');
dashboard = dashboard.replace(/<button \n          onClick=\{\(\) => \{\n            if \(window.caches\)[^<]+FORCE CLEAR CACHE\n        <\/button>/, '');
fs.writeFileSync('frontend/pages/Dashboard.jsx', dashboard);
