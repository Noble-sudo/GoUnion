const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /setSelectedChatId\(null\);\s*setSearchParams\(\{\},\s*\{\s*replace:\s*true\s*\}\);/g,
    'if (!embeddedChatId) { setSelectedChatId(null); setSearchParams({}, { replace: true }); }'
);

c = c.replace(
    /<button onClick=\{\(\) => \{\s*if \(\!embeddedChatId\) \{\s*setSelectedChatId\(null\);\s*setSearchParams\(\{\}, \{\s*replace: true\s*\}\);\s*\}\s*\}\} className="md:hidden/g,
    '{!embeddedChatId && <button onClick={() => { if (!embeddedChatId) { setSelectedChatId(null); setSearchParams({}, { replace: true }); } }} className="md:hidden'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched back button for embeddedChatId in Messages.jsx');
