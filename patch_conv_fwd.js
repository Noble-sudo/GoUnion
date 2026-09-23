import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

c = c.replace(
    'reply_to_id: req.body.reply_to_id || null,',
    'reply_to_id: req.body.reply_to_id || null,\n        is_forwarded: req.body.is_forwarded || false,'
);

fs.writeFileSync('backend/src/routes/conversations.js', c);
console.log("Patched conversations.js");
