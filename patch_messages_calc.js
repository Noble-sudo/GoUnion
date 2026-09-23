const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /className=\{\`calc\(100vh\) \$\{embeddedChatId \? "h-\[600px\]" : "h-\[100dvh\]"\}/,
    'className={`${embeddedChatId ? "h-[600px]" : "h-[100dvh]"}'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed Messages.jsx calc syntax error');
