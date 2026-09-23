import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
    'sendMessage: async (conversationId, content, file, audioBlob, sticker, replyToId, isForwarded = false) => {',
    'sendMessage: async (conversationId, content, file, audioBlob, sticker, replyToId, isForwarded = false, forwardedMedia = null) => {'
);

const payloadBlock = `            const res = await apiClient.post(\`/conversations/\${conversationId}/messages/\`, {
                conversation_id: conversationId,
                content: content || "",
                image_url: imageUrl,
                video_url: videoUrl,
                audio_url: audioUrl,
                sticker_url: sticker?.url || null,
                sticker_id: sticker?.id || null,
                reply_to_id: replyToId || null,
                is_forwarded: isForwarded,
            });`;

const newPayloadBlock = `            const res = await apiClient.post(\`/conversations/\${conversationId}/messages/\`, {
                conversation_id: conversationId,
                content: content || "",
                image_url: imageUrl || forwardedMedia?.imageUrl || null,
                video_url: videoUrl || forwardedMedia?.videoUrl || null,
                audio_url: audioUrl || forwardedMedia?.audioUrl || null,
                sticker_url: sticker?.url || forwardedMedia?.stickerUrl || null,
                sticker_id: sticker?.id || forwardedMedia?.stickerId || null,
                reply_to_id: replyToId || null,
                is_forwarded: isForwarded,
            });`;

c = c.replace(payloadBlock, newPayloadBlock);

fs.writeFileSync('frontend/services/api.js', c);
console.log("Patched api.js to support forwardedMedia");
