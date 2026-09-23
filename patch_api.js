import fs from 'fs';
let file = fs.readFileSync('frontend/services/api.js', 'utf8');
file = file.replace(
  'fileName: rawFileUrl ? rawFileUrl.split(\'/\').pop() : null,\n        isRead:',
  'fileName: rawFileUrl ? rawFileUrl.split(\'/\').pop() : null,\n        replyToId: m.reply_to_id || m.replyToId || null,\n        isRead:'
);
fs.writeFileSync('frontend/services/api.js', file);
