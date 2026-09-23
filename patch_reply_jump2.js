const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\{repliedMsg && \(\r?\n\s*<div className=\{\`mb-2 p-2 rounded-xl border-l-2/g,
    `{repliedMsg && (
        <div onClick={() => document.getElementById(\`msg-\${repliedMsg.id}\`)?.scrollIntoView({behavior: 'smooth', block: 'center'})} className={\`cursor-pointer hover:opacity-80 transition-opacity mb-2 p-2 rounded-xl border-l-2`
);

c = c.replace(
    /\{String\(repliedMsg\.senderId\) === String\(currentUserId\) \? "You" : \(repliedMsg\.sender\?\.fullName \|\| \(activeChat\?\.partner\?\.isGroup \? "Group Member" : activeChat\?\.partner\?\.fullName\) \|\| "User"\)\}/g,
    `{String(repliedMsg.senderId) === String(currentUserId) ? "You" : (repliedMsg.sender?.fullName || "User")}`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched Reply jump manually!');
