const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /<\/div>\r?\n\r?\n\s*<\/div>\r?\n\s*<div className="p-3 bg-\[#050505\]">/g,
    `</div>\n                    <div className="p-3 bg-[#050505]">`
);

c = c.replace(
    /\{activeChat\?\.isLeft \? \(\r?\n\s*<div className="px-5 py-4 bg-\[#111114\] text-white\/50 text-center text-sm border-t border-white\/5 flex flex-col items-center justify-center h-\[72px\]">\r?\n\s*You are no longer a participant in this group\.\r?\n\s*<\/div>\r?\n\s*\) : \(\r?\n\s*\{currentUser\?\.blockedUsers\?\.includes\(String\(activeChat\?\.partner\?\.id\)\)/g,
    `{activeChat?.isLeft ? (
                                <div className="px-5 py-4 bg-[#111114] text-white/50 text-center text-sm border-t border-white/5 flex flex-col items-center justify-center h-[72px]">
                                    You are no longer a participant in this group.
                                </div>
                            ) : currentUser?.blockedUsers?.includes(String(activeChat?.partner?.id))`
);

c = c.replace(
    /const leaveGroupMutation = useMutation\(\{[\s\S]*?toast\("You left the group", "success"\);\s*setSelectedChatId\(null\);\s*\},[\s\S]*?\}\);/,
    ''
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed syntaxes');
