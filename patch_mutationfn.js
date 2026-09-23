import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'mutationFn: ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded }) => api.chats.sendMessage(chatId, content, file, audioBlob, sticker, replyToId, isForwarded),',
    'mutationFn: ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia }) => api.chats.sendMessage(chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia),'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched mutationFn signature!");
