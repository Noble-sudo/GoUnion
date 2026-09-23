import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Replace the specific lines
content = content.replace(/    const userIdFromQuery = searchParams\.get\("userId"\);\r?\n    const queryUsername = searchParams\.get\("username"\) \|\| "";\r?\n    const queryName = searchParams\.get\("name"\) \|\| queryUsername \|\| "New chat";\r?\n    const queryAvatar = searchParams\.get\("avatar"\) \|\| "";/, `    const userIdFromQuery = embeddedChatId ? null : searchParams.get("userId");
    const chatIdFromQuery = embeddedChatId ? embeddedChatId : searchParams.get("chat");
    const queryUsername = embeddedChatId ? null : (searchParams.get("username") || "");
    const queryName = embeddedChatId ? null : (searchParams.get("name") || queryUsername || "New chat");
    const queryAvatar = embeddedChatId ? null : (searchParams.get("avatar") || "");`);

fs.writeFileSync('frontend/pages/Messages.jsx', content);
console.log("Patched!");
