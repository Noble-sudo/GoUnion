import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    '<div className="p-3 bg-[#050505]">',
    '</div>\n                    <div className="p-3 bg-[#050505]">'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Injected missing div!");
