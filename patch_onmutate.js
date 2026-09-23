import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'onMutate: async ({ content, file, audioBlob, sticker, replyToId }) => {',
    'onMutate: async ({ content, file, audioBlob, sticker, replyToId, isForwarded, forwardedMedia }) => {'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched onMutate signature!");
