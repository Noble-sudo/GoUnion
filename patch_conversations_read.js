import fs from 'fs';

let content = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

const regex = /      \/\/ Mark all unread messages from other users in this conversation as read\r?\n      await Message\.updateMany\(\r?\n        \{ conversation_id: conversation\.id, sender_id: \{ \$ne: req\.user\.id \}, is_read: false \},\r?\n        \{ is_read: true \}\r?\n      \);/;

const replacement = `      // Mark all unread messages from other users in this conversation as read
      await Message.updateMany(
        { conversation_id: conversation.id, sender_id: { $ne: req.user.id }, is_read: false },
        { is_read: true }
      );
      
      // Also update seen_by array for all messages sent by others, ensuring we don't push duplicates
      await Message.updateMany(
        { 
          conversation_id: conversation.id, 
          sender_id: { $ne: req.user.id },
          "seen_by.user_id": { $ne: req.user.id }
        },
        { 
          $push: { seen_by: { user_id: req.user.id, seen_at: new Date() } }
        }
      );`;

content = content.replace(regex, replacement);

fs.writeFileSync('backend/src/routes/conversations.js', content);
console.log("Patched conversations.js for seen_by!");
