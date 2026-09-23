import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /const activeChatId = selectedChatId;/g,
    'const activeChatId = chatId || selectedChatId;'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched sendMessageMutation to use correct chatId");
