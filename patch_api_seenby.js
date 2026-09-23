import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

const regex = /sender: m\.sender \? transformUser\(m\.sender\) : null,\r?\n          replyToId: m\.reply_to_id \|\| m\.replyToId \|\| null,/;

const replacement = `sender: m.sender ? transformUser(m.sender) : null,
          seenByUsers: m.seen_by_users ? m.seen_by_users.map(s => ({ user: transformUser(s.user), seenAt: s.seen_at })) : [],
          replyToId: m.reply_to_id || m.replyToId || null,`;

content = content.replace(regex, replacement);

fs.writeFileSync('frontend/services/api.js', content);
console.log("Patched api.js transformMessage for seenByUsers!");
