import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
    'isDeleted: m.is_deleted ?? m.isDeleted ?? false,',
    'isDeleted: m.is_deleted ?? m.isDeleted ?? false,\n        isForwarded: m.is_forwarded ?? m.isForwarded ?? false,'
);

c = c.replace(
    'sendMessage: async (conversationId, content, file, audioBlob, sticker, replyToId) => {',
    'sendMessage: async (conversationId, content, file, audioBlob, sticker, replyToId, isForwarded = false) => {'
);

const postBlock = `            const res = await apiClient.post(\`/conversations/\${conversationId}/messages/\`, {
                conversation_id: conversationId,
                content: content || "",
                image_url: imageUrl,
                video_url: videoUrl,
                audio_url: audioUrl,
                sticker_url: sticker?.url || null,
                sticker_id: sticker?.id || null,
                reply_to_id: replyToId || null,
            });`;

const postReplacement = `            const res = await apiClient.post(\`/conversations/\${conversationId}/messages/\`, {
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

c = c.replace(postBlock, postReplacement);

fs.writeFileSync('frontend/services/api.js', c);
console.log("Patched api.js for isForwarded");
