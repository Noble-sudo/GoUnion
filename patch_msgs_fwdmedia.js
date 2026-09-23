import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'mutationFn: ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded }) => api.chats.sendMessage(chatId, content, file, audioBlob, sticker, replyToId, isForwarded),',
    'mutationFn: ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia }) => api.chats.sendMessage(chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia),'
);

c = c.replace(
    'onMutate: async ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded }) => {',
    'onMutate: async ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia }) => {'
);

const oldOptimistic = `                imageUrl: file && file.type.startsWith("image/") ? previewUrl : null,
                videoUrl: file && file.type.startsWith("video/") ? previewUrl : null,
                audioUrl: audioPreviewUrl,
                stickerUrl: sticker?.url || null,
                stickerId: sticker?.id || null,`;

const newOptimistic = `                imageUrl: (file && file.type.startsWith("image/") ? previewUrl : null) || forwardedMedia?.imageUrl || null,
                videoUrl: (file && file.type.startsWith("video/") ? previewUrl : null) || forwardedMedia?.videoUrl || null,
                audioUrl: audioPreviewUrl || forwardedMedia?.audioUrl || null,
                stickerUrl: sticker?.url || forwardedMedia?.stickerUrl || null,
                stickerId: sticker?.id || forwardedMedia?.stickerId || null,`;

c = c.replace(oldOptimistic, newOptimistic);

const oldPayload = `sendMessageMutation.mutate({ 
                                                chatId: chat?.id, 
                                                content: msgToForward.content || undefined, 
                                                isForwarded: true 
                                            });`;

const newPayload = `sendMessageMutation.mutate({ 
                                                chatId: chat?.id, 
                                                content: msgToForward.content || undefined, 
                                                isForwarded: true,
                                                forwardedMedia: {
                                                    imageUrl: msgToForward.imageUrl,
                                                    videoUrl: msgToForward.videoUrl,
                                                    audioUrl: msgToForward.audioUrl,
                                                    stickerUrl: msgToForward.stickerUrl,
                                                    stickerId: msgToForward.stickerId
                                                }
                                            });`;

c = c.replace(oldPayload, newPayload);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched Messages.jsx for forwardedMedia");
