import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'mutationFn: ({ chatId, content, file, audioBlob, sticker, replyToId }) => api.chats.sendMessage(chatId, content, file, audioBlob, sticker, replyToId),',
    'mutationFn: ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded }) => api.chats.sendMessage(chatId, content, file, audioBlob, sticker, replyToId, isForwarded),'
);

c = c.replace(
    'onMutate: async ({ chatId, content, file, audioBlob, sticker, replyToId }) => {',
    'onMutate: async ({ chatId, content, file, audioBlob, sticker, replyToId, isForwarded }) => {'
);

c = c.replace(
    'replyToId: replyToId || null,',
    'replyToId: replyToId || null,\n                isForwarded: isForwarded || false,'
);

// Update forward payload
const targetPayload = `const fwdContent = \`Forwarded:\\n\\n\${msgToForward.content || ''}\${mediaStr ? '\\n' + mediaStr : ''}\`;
                                            sendMessageMutation.mutate({ chatId: chat?.id, content: fwdContent });`;

const newPayload = `sendMessageMutation.mutate({ 
                                                chatId: chat?.id, 
                                                content: msgToForward.content || undefined, 
                                                isForwarded: true 
                                            });`;

c = c.replace(targetPayload, newPayload);

// Add the rendered Forwarded label
const targetOuterUsername = `<div className={\`flex flex-col gap-1 \${mine ? "items-end" : "items-start"}\`}>
                                                                {!mine && activeChat?.partner?.isGroup && (
                                                                    <div className="text-[11px] font-bold tracking-wide ml-1" style={{ color: getUserColor(msg.sender?.id) }}>
                                                                        {msg.sender?.fullName || msg.sender?.username || "Member"}
                                                                    </div>
                                                                )}`;

const replacementOuterUsername = `<div className={\`flex flex-col gap-1 \${mine ? "items-end" : "items-start"}\`}>
                                                                {msg.isForwarded && (
                                                                    <div className={\`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mb-0.5 \${mine ? "text-white/50 mr-1" : "text-white/40 ml-1"}\`}>
                                                                        <Share size={10} /> Forwarded
                                                                    </div>
                                                                )}
                                                                {!mine && activeChat?.partner?.isGroup && (
                                                                    <div className="text-[11px] font-bold tracking-wide ml-1" style={{ color: getUserColor(msg.sender?.id) }}>
                                                                        {msg.sender?.fullName || msg.sender?.username || "Member"}
                                                                    </div>
                                                                )}`;

c = c.replace(targetOuterUsername, replacementOuterUsername);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched UI for forwarded messages");
