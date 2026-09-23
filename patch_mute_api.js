const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /return isMuted \? api\.chats\.unmuteConversation\(conversationId\) : api\.chats\.muteConversation\(conversationId\);/g,
    `return isMuted ? api.conversations.unmuteConversation(conversationId) : api.conversations.muteConversation(conversationId);`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed API reference for muteConversation');
