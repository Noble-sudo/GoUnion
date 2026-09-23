const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// 1. Reply to name
c = c.replace(
    /Replying to \{String\(replyToMsg\.senderId\) === String\(currentUserId\) \? "yourself" : activeChat\.partner\.fullName\}/g,
    'Replying to {String(replyToMsg.senderId) === String(currentUserId) ? "yourself" : replyToMsg?.sender?.fullName || activeChat.partner.fullName}'
);

// 2. Remove "Forward" and "Info" words from Context Menu
c = c.replace(
    /<span className="text-white">Forward<\/span>/g,
    '' // Just remove the text entirely or hide it. Wait, the span is there.
);
c = c.replace(
    /<span className="text-white\/80">Info<\/span>/g,
    ''
);

// 3. Member names and avatars in embedded chat
// Where messages are rendered: 
// <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${isMine ? "flex-row-reverse" : "flex-row"} ${isConsecutive ? "mt-1" : "mt-4"}`}>
// I want to inject the avatar before the message bubble if !isMine and embeddedChatId
const messageRenderMatch = /className=\{\`flex gap-2 max-w-\[85%\] sm:max-w-\[75%\] \$\{isMine \? "flex-row-reverse" : "flex-row"\} \$\{isConsecutive \? "mt-1" : "mt-4"\}\`\}/g;

c = c.replace(messageRenderMatch, 
    'className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${isMine ? "flex-row-reverse" : "flex-row"} ${isConsecutive ? "mt-1" : "mt-4"} relative group`}'
);

// To render the avatar and name, I need to find the inside of this div.
// It looks like:
// children: [
//     (!isMine && embeddedChatId && !isConsecutive) && <Avatar src={msg.sender?.avatarUrl} label={msg.sender?.fullName} className="w-6 h-6 rounded-full self-end mb-1 shrink-0" />,
//     _jsxs("div", { ... message bubble ... })
// ]
// Instead of complex AST manipulation, I can just use a simple regex replacing `_jsxs("div", { className: \`flex flex-col` (this is the bubble container usually).

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched basic things in Messages.jsx');
