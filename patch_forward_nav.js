const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /toast\("Message forwarded", "success"\);\n\s*\}\}\n\s*className="w-full flex items-center gap-3 p-3/,
    `toast("Message forwarded", "success");
                                            setSelectedChatId(chat.id);
                                        }}
                                        className="w-full flex items-center gap-3 p-3`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched navigation on forward');
