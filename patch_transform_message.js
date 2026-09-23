import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

const regex = /senderId: m\.sender_id,\r?\n          replyToId: m\.reply_to_id \|\| m\.replyToId \|\| null,/;

const replacement = `senderId: m.sender_id,
          sender: m.sender ? transformUser(m.sender) : null,
          replyToId: m.reply_to_id || m.replyToId || null,`;

content = content.replace(regex, replacement);

fs.writeFileSync('frontend/services/api.js', content);
console.log("Patched transformMessage!");
