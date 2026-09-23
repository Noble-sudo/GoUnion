const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /<div className=\{\`flex max-w-\[82%\] sm:max-w-\[70%\]\`\}>\n\s*\{\(\!mine && activeChat\?\.partner\?\.isGroup\) && \(\n\s*<Link to=\{\`\/profile\/\$\{msg\.sender\?\.username\}\`\} className="mr-2 mt-auto shrink-0 flex items-end">\n\s*\{\!isConsecutive \? \(\n\s*<Avatar src=\{msg\.sender\?\.avatarUrl\} label=\{msg\.sender\?\.fullName\} className="w-6 h-6 rounded-full object-cover bg-white\/10 border border-white\/5" \/>\n\s*\) : \(\n\s*<div className="w-6 h-6" \/>\n\s*\)\}\n\s*<\/Link>\n\s*\)\}\n\s*<div className=\{\`flex flex-col gap-1 w-full max-w-full \$\{mine \? "items-end" : "items-start"\}\`\}>/g,
    `<div className={\`flex flex-row items-end gap-2 max-w-[85%] sm:max-w-[75%]\`}>
    {(!mine && activeChat?.partner?.isGroup) && (
        <Link to={\`/profile/\${msg.sender?.username}\`} className="shrink-0 mb-1">
            {!isConsecutive ? (
                <Avatar src={msg.sender?.avatarUrl} label={msg.sender?.fullName} className="w-8 h-8 rounded-full object-cover bg-white/10 border border-white/5" />
            ) : (
                <div className="w-8 h-8" />
            )}
        </Link>
    )}
    <div className={\`flex flex-col gap-1 flex-1 min-w-0 \${mine ? "items-end" : "items-start"}\`}>`
);

// ALSO FIX SYSTEM MESSAGES!
// Let's replace `<React.Fragment key={msg.id}>` block to handle system messages.
const regexSys = /(<React\.Fragment key=\{msg\.id\}>\s*\{showDate && \(\s*<div className="sticky top-2 z-10 my-3 flex justify-center">\s*<span className="rounded-full border border-white\/10 bg-black\/60 px-3 py-1 text-\[10px\] font-black uppercase tracking-widest text-white\/45 backdrop-blur">\{msg\.dateLabel\}<\/span>\s*<\/div>\s*\)\}\s*)(?:\{index === firstUnreadIndex && \(\s*<div className="flex items-center gap-4 my-4 w-full px-2">\s*<div className="flex-1 h-px bg-primary\/20"><\/div>\s*<span className="text-\[9px\] font-black uppercase tracking-widest text-primary bg-primary\/10 border border-primary\/20 px-2 py-0\.5 rounded-md shadow-\[0_0_10px_rgba\(196,255,14,0\.1\)\]">New Messages<\/span>\s*<div className="flex-1 h-px bg-primary\/20"><\/div>\s*<\/div>\s*\)\})?\s*<motion\.div/;

// Wait, I will just do a simpler replace.
const regexSys2 = /(<React\.Fragment key=\{msg\.id\}>[\s\S]*?(?:New Messages<\/span>\s*<div className="flex-1 h-px bg-primary\/20"><\/div>\s*<\/div>\s*\)\})?)\s*<motion\.div/m;
const match = c.match(regexSys2);
if (match) {
    c = c.replace(regexSys2, `$1
        {msg.senderId === 'system' ? (
            <div className="flex justify-center my-3 w-full">
                <span className="bg-white/5 border border-white/10 rounded-2xl px-4 py-1.5 text-xs font-medium text-white/60 text-center mx-4 shadow-sm">{msg.content}</span>
            </div>
        ) : (
        <motion.div`);
}

// Ensure we close the ternary at the end!
// Let's find where to close the ternary for system messages.
// The end of the message loop is `</motion.div>\n</React.Fragment>`
c = c.replace(/<\/motion\.div>\n\s*<\/React\.Fragment>/g, '</motion.div>\n        )}\n                                                      </React.Fragment>');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched layout and system messages');
