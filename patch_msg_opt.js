import fs from 'fs';
let file = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');
file = file.replace(
  'senderId: currentUserId,\n                timestamp:',
  'senderId: currentUserId,\n                replyToId: replyToId || null,\n                timestamp:'
);
fs.writeFileSync('frontend/pages/Messages.jsx', file);
