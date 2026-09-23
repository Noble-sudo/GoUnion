import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetStr = `                                            const senderName = String(msgToForward?.senderId) === String(currentUserId) ? currentUser?.fullName : activeChat?.partner?.fullName;
                                            const mediaStr = [msgToForward.imageUrl, msgToForward.videoUrl, msgToForward.fileUrl].filter(Boolean).join('\\n');
                                            const fwdContent = \`Forwarded:\\n\\n\${msgToForward.content || ''}\${mediaStr ? '\\n' + mediaStr : ''}\`;
                                            sendMessageMutation.mutate({ chatId: chat?.id, content: fwdContent });`;

const newStr = `                                            sendMessageMutation.mutate({ 
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

if (c.includes(targetStr)) {
    c = c.replace(targetStr, newStr);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Successfully fixed forward payload!");
} else {
    console.log("Target string not found in Messages.jsx! Check manually.");
}
