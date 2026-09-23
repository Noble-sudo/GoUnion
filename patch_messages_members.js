const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\{\(\!mine && embeddedChatId && \!isConsecutive\) && \(/,
    '{(!mine && activeChat?.partner?.isGroup && !isConsecutive) && ('
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed member names condition in group chat');
