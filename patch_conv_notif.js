import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

c = c.replace(
    "addNotification({ user_id: id, sender_id: req.user.id, type: 'new_message' })))",
    "addNotification({ user_id: id, sender_id: req.user.id, type: 'new_message', conversation_id: conversation.id })))"
);

fs.writeFileSync('backend/src/routes/conversations.js', c);
console.log('Patched conversation notifications!');
