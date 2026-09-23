const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\{msg\.senderId === 'system' \? \(\n\s*<div className="flex justify-center my-3 w-full">/,
    `{msg.senderId === 'system' ? (
        <div id={\`msg-\${msg.id}\`} className="flex justify-center my-3 w-full">`
);

c = c.replace(
    /<\/div>\n\s*\) : \(\n\s*<motion\.div/,
    `</div>
    ) : (
        <motion.div id={\`msg-\${msg.id}\`}`
);

// Fix Reply box
c = c.replace(
    /\{repliedMsg && \(\n\s*<div className=\{\`mb-2 p-2 rounded-xl border-l-2/,
    `{repliedMsg && (
        <div onClick={() => document.getElementById(\`msg-\${repliedMsg.id}\`)?.scrollIntoView({behavior: 'smooth', block: 'center'})} className={\`mb-2 p-2 rounded-xl cursor-pointer hover:opacity-80 transition-opacity border-l-2`
);

c = c.replace(
    /\{String\(repliedMsg\.senderId\) === String\(currentUserId\) \? "You" : \(activeChat\?\.partner\?\.fullName \|\| "User"\)\}/g,
    `{String(repliedMsg.senderId) === String(currentUserId) ? "You" : (repliedMsg.sender?.fullName || "User")}`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched reply box and IDs');
