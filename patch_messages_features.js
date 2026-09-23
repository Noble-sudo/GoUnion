const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /<Share size=\{14\} \/> Forward/g,
    '<Share size={14} />'
);
c = c.replace(
    /<Info size=\{14\} \/> Message info/g,
    '<Info size={14} />'
);

const messageContainerMatch = /<div className=\{\`flex max-w-\[82%\] flex-col gap-1 sm:max-w-\[70%\] \$\{mine \? "items-end" : "items-start"\}\`\}>/g;
const injectedHtml = `<div className={\`flex max-w-[82%] flex-col gap-1 sm:max-w-[70%] \${mine ? "items-end" : "items-start"}\`}>
    {(!mine && embeddedChatId && !isConsecutive) && (
        <div className="flex items-center gap-2 mb-1 ml-1">
            <Avatar src={msg.sender?.avatarUrl} alt={msg.sender?.fullName} label={msg.sender?.fullName} className="w-5 h-5 rounded-full object-cover bg-white/10" />
            <span className="text-[11px] font-bold text-white/60">{msg.sender?.fullName || 'User'}</span>
        </div>
    )}`;

c = c.replace(messageContainerMatch, injectedHtml);

// Wait, I should also inject 'isConsecutive' calculation because it's not in the map loop.
// In the map loop, I see `const showDate = ...`
// Let's add `const isConsecutive = index > 0 && messages[index - 1].senderId === msg.senderId && !showDate;`
c = c.replace(
    /const repliedMsg = msg\.replyToId \? messages\.find\(m => String\(m\.id\) === String\(msg\.replyToId\)\) : null;/g,
    `const repliedMsg = msg.replyToId ? messages.find(m => String(m.id) === String(msg.replyToId)) : null;
     const isConsecutive = index > 0 && String(messages[index - 1].senderId) === String(msg.senderId) && !showDate;`
);

// We also need to import Avatar if it's not imported. Wait, Avatar is already imported!

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched group chat member info');
