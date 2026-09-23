import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

content = content.replace(/        senderId: m\.sender_id,\n        replyToId: m\.reply_to_id \|\| m\.replyToId \|\| null,/g, `        senderId: m.sender_id,
        sender: m.sender ? transformUser(m.sender) : null,
        replyToId: m.reply_to_id || m.replyToId || null,`);

fs.writeFileSync('frontend/services/api.js', content);
console.log("Patched transformMessage to include sender!");
