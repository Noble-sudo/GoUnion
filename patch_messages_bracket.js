const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\{!embeddedChatId && <button onClick=\{\(\) => \{ if \(\!embeddedChatId\) \{ setSelectedChatId\(null\); setSearchParams\(\{\}, \{ replace: true \}\); \} \}\} className="md:hidden h-10 w-10 shrink-0 rounded-xl text-white\/60 hover:text-white hover:bg-white\/5 flex items-center justify-center z-50">\s*<ArrowLeft size=\{21\} \/>\s*<\/button>/,
    '{!embeddedChatId && (<button onClick={() => { if (!embeddedChatId) { setSelectedChatId(null); setSearchParams({}, { replace: true }); } }} className="md:hidden h-10 w-10 shrink-0 rounded-xl text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-center z-50"><ArrowLeft size={21} /></button>)}'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched Messages.jsx missing bracket');
