import fs from 'fs';

let apiCode = fs.readFileSync('frontend/services/api.js', 'utf8');

if (!apiCode.includes('replyToId: m.reply_to_id')) {
  apiCode = apiCode.replace(
    'isRead: m.is_read || false,',
    'isRead: m.is_read || false,\n        replyToId: m.reply_to_id || m.replyToId || null,'
  );
  fs.writeFileSync('frontend/services/api.js', apiCode);
  console.log('Patched api.js transformMessage with replyToId');
}
