import fs from 'fs';

let convJs = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

convJs = convJs.replace(
  /sticker_id:\s*req\.body\.sticker_id\s*\|\|\s*null,([\s\n]*)is_read:\s*false,/,
  'sticker_id: req.body.sticker_id || null,\n        reply_to_id: req.body.reply_to_id || null,\n        is_read: false,'
);

fs.writeFileSync('backend/src/routes/conversations.js', convJs);
