const fs = require('fs');

// 1. Patch api.js to pass is_forwarded
let apiSrc = fs.readFileSync('frontend/services/api.js', 'utf8');

apiSrc = apiSrc.replace(
    /audioUrl = await uploadFile\(audioFile\);\s*\}/,
    `audioUrl = await uploadFile(audioFile);\n            }\n            if (forwardedMedia) {\n                imageUrl = imageUrl || forwardedMedia.imageUrl;\n                videoUrl = videoUrl || forwardedMedia.videoUrl;\n                audioUrl = audioUrl || forwardedMedia.audioUrl;\n                if (forwardedMedia.fileUrl) imageUrl = imageUrl || forwardedMedia.fileUrl;\n            }`
);

apiSrc = apiSrc.replace(
    /reply_to_id: replyToId \|\| null,\s*\}\);/,
    `reply_to_id: replyToId || null,\n                is_forwarded: isForwarded,\n            });`
);

fs.writeFileSync('frontend/services/api.js', apiSrc);
console.log('Patched api.js for forwarded messages');

// 2. Patch Messages.jsx Forward Modal onClick
let msgsSrc = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const oldForwardLogic = /const senderName = String\(msgToForward\.senderId\) === String\(currentUserId\) \? currentUser\?\.fullName : activeChat\?\.partner\?\.fullName;\s*const mediaStr = \[msgToForward\.imageUrl, msgToForward\.videoUrl, msgToForward\.fileUrl\]\.filter\(Boolean\)\.join\('\\n'\);\s*const fwdContent = \`Forwarded:\\n\\n\$\{msgToForward\.content \|\| ''\}\$\{mediaStr \? '\\n' \+ mediaStr : ''\}\`;\s*sendMessageMutation\.mutate\(\{ chatId: chat\.id, content: fwdContent \}\);/;

const newForwardLogic = `const fwdContent = msgToForward.content || '';
                                            const fwdMedia = {
                                                imageUrl: msgToForward.imageUrl,
                                                videoUrl: msgToForward.videoUrl,
                                                fileUrl: msgToForward.fileUrl,
                                                audioUrl: msgToForward.audioUrl
                                            };
                                            sendMessageMutation.mutate({ chatId: chat.id, content: fwdContent, isForwarded: true, forwardedMedia: fwdMedia });`;

msgsSrc = msgsSrc.replace(oldForwardLogic, newForwardLogic);

fs.writeFileSync('frontend/pages/Messages.jsx', msgsSrc);
console.log('Patched Messages.jsx for forward button');
