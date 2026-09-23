const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Strip out inline Forward and Info icons entirely
c = c.replace(
    /<button onClick=\{\(\) => \{ setMsgToForward\(msg\); setIsForwardModalOpen\(true\); \}\} className="hover:text-white transition-colors flex items-center gap-1" title="Forward">\s*<Share size=\{12\} \/>\s*<\/button>/g,
    ''
);

c = c.replace(
    /\{mine && \(\s*<button onClick=\{\(\) => setInfoMessage\(msg\)\} className="hover:text-white transition-colors flex items-center gap-1" title="Message Info">\s*<Info size=\{12\} \/>\s*<\/button>\s*\)\}/g,
    ''
);

// We need to double check if the Info icon button was not wrapped in mine
c = c.replace(
    /\{navigator\.share && \(\s*<button onClick=\{\(\) => setInfoMessage\(msg\)\} className="hover:text-white transition-colors flex items-center gap-1" title="Message Info">\s*<Info size=\{12\} \/>\s*<\/button>\s*\)\}/g,
    ''
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Removed inline icons');
