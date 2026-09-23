const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /className=\{\`\\?\$\{embeddedChatId \? "h-\[600px\]" : "h-\[100dvh\]"\}/,
    'className={`calc(100vh) ${embeddedChatId ? "h-[600px]" : "h-[100dvh]"}'
);
// wait, `calc(100vh) ` is not tailwind, it should be just the resolved value:
c = c.replace(
    /className=\{\`\\?\$\{embeddedChatId \? "h-\[600px\]" : "h-\[100dvh\]"\}/,
    'className={`${embeddedChatId ? "h-[600px]" : "h-[100dvh]"}'
);
// Actually, let's just make it simpler:
c = c.replace(
    /className=\{\`\\\$\{embeddedChatId \? "h-\[600px\]" : "h-\[100dvh\]"\}/,
    'className={`${embeddedChatId ? "h-[600px]" : "h-[100dvh]"}'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed Messages.jsx height syntax error');
