import fs from 'fs';
let file = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');
file = file.replace(
  '      sticker_id: req.body.sticker_id || null,\n      is_read: false,',
  '      sticker_id: req.body.sticker_id || null,\n      reply_to_id: req.body.replyToId || req.body.reply_to_id || null,\n      is_read: false,'
);
fs.writeFileSync('backend/src/routes/conversations.js', file);
