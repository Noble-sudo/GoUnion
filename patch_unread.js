const fs = require('fs');

// Patch store.js
let storeCode = fs.readFileSync('backend/src/store.js', 'utf8');
storeCode = storeCode.replace(
    /unreadCount = await Message\.countDocuments\(\{\s*conversation_id: conversation\.id,\s*sender_id: \{ \$ne: viewerId \},\s*is_read: false,\s*\}\);/g,
    `unreadCount = await Message.countDocuments({\n        conversation_id: conversation.id,\n        sender_id: { $ne: viewerId },\n        'seen_by.user_id': { $ne: viewerId }\n      });`
);
fs.writeFileSync('backend/src/store.js', storeCode);
console.log('Patched store.js');

// Patch conversations.js
let convCode = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

const oldReadLogic = `      // Mark all unread messages from other users in this conversation as read
      await Message.updateMany(
        { conversation_id: conversation.id, sender_id: { $ne: req.user.id }, is_read: false },
        { is_read: true }
      );
  
      // Also update seen_by array for read receipts
      await Message.updateMany(
        { 
          conversation_id: conversation.id, 
          sender_id: { $ne: req.user.id },
          'seen_by.user_id': { $ne: req.user.id }
        },
        { 
          $push: { seen_by: { user_id: req.user.id, seen_at: new Date() } }
        }
      );`;

const newReadLogic = `      // Update seen_by array for read receipts and unread badge calculation
      await Message.updateMany(
        { 
          conversation_id: conversation.id, 
          sender_id: { $ne: req.user.id },
          'seen_by.user_id': { $ne: req.user.id }
        },
        { 
          $push: { seen_by: { user_id: req.user.id, seen_at: new Date() } }
        }
      );

      // Only set is_read globally if it's a direct message to support legacy 1-1 read receipts
      if (!conversation.group_id && !conversation.participant_key?.startsWith('group_')) {
          await Message.updateMany(
            { conversation_id: conversation.id, sender_id: { $ne: req.user.id }, is_read: false },
            { is_read: true }
          );
      }`;

convCode = convCode.replace(oldReadLogic, newReadLogic);
fs.writeFileSync('backend/src/routes/conversations.js', convCode);
console.log('Patched conversations.js');
