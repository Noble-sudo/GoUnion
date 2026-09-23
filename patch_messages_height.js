import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /<div className="h-\[100dvh\] w-full bg-\[#030303\] text-white overflow-hidden">/g,
    '<div className={`${embeddedChatId ? "h-[600px]" : "h-[100dvh]"} w-full bg-[#030303] text-white overflow-hidden`}>'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched Messages.jsx height for embedded');
