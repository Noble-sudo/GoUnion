const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /const \[isChatMenuOpen,\s*setIsChatMenuOpen\] = useState\(false\);/,
    `const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);\n    const [leftGroupChat, setLeftGroupChat] = useState(null);`
);

// Also check if leaveGroupMutation exists and needs to be updated with setLeftGroupChat
c = c.replace(
    /onSuccess: \(_, groupId\) => \{\s*queryClient\.invalidateQueries\(\["chats"\]\);/,
    `onSuccess: (_, groupId) => {\n            const leftChat = chats?.find(c => String(c?.partner?.id) === String(groupId) || String(c?.id) === String(groupId));\n            if (leftChat) setLeftGroupChat({...leftChat, isLeft: true});\n            queryClient.invalidateQueries(["chats"]);`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed leftGroupChat state');
