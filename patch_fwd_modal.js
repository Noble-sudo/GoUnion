import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const regex = /const senderName = String\(msgToForward\.senderId\) === String\(currentUserId\) \? currentUser\?\.fullName : activeChat\?\.partner\?\.fullName;\s*const mediaStr = \[msgToForward\.imageUrl, msgToForward\.videoUrl, msgToForward\.fileUrl\]\.filter\(Boolean\)\.join\('\\n'\);\s*const fwdContent = `Forwarded from \$\{senderName\}:\\n\\n\$\{msgToForward\.content \|\| ''\}\$\{mediaStr \? '\\n' \+ mediaStr : ''\}`;\s*sendMessageMutation\.mutate\(\{ chatId: chat\.id, content: fwdContent \}\);/;

const newStr = `sendMessageMutation.mutate({ 
                                                chatId: chat.id, 
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

if (c.match(regex)) {
    c = c.replace(regex, newStr);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Patched forwarding modal mutate!");
} else {
    console.log("Forward block not found!");
}
