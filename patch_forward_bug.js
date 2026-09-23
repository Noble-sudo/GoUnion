const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /onMutate: async \(\{ content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia \}\) => \{\n\s*const activeChatId = selectedChatId;/,
    'onMutate: async ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia }) => {\n              const activeChatId = chatId || selectedChatId;'
);

c = c.replace(
    /mutationFn: \(\{ chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia \}\) => api\.chats\.sendMessage\(chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia\)/,
    'mutationFn: ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia }) => api.chats.sendMessage(chatId || selectedChatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia)'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched forward bug');
