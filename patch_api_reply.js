import fs from 'fs';

let apiJs = fs.readFileSync('frontend/services/api.js', 'utf8');

apiJs = apiJs.replace(
  /isDeleted:\s*m\.is_deleted\s*\?\?\s*m\.isDeleted\s*\?\?\s*false,([\s\n]*)senderId:\s*m\.sender_id,/,
  'isDeleted: m.is_deleted ?? m.isDeleted ?? false,\n        senderId: m.sender_id,\n        replyToId: m.reply_to_id || m.replyToId || null,'
);

fs.writeFileSync('frontend/services/api.js', apiJs);
