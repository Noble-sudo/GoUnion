import fs from 'fs';

let code = fs.readFileSync('backend/src/routes/notifications.js', 'utf8');

// Filter out new_message from GET /
code = code.replace(
  'const notifications = await Notification.find({ user_id: req.user.id }).sort({ created_at: -1 }).limit(100);',
  'const notifications = await Notification.find({ user_id: req.user.id, type: { $ne: "new_message" } }).sort({ created_at: -1 }).limit(100);'
);

// Filter out new_message from GET /unread-count
code = code.replace(
  '{ user_id: req.user.id, is_read: false }',
  '{ user_id: req.user.id, is_read: false, type: { $ne: "new_message" } }'
);

// We also need to mark all new_message as read when getting unread count so they don't linger forever?
// Nah, just excluding them from the count is fine, they won't trigger the notification badge anymore.

fs.writeFileSync('backend/src/routes/notifications.js', code);
console.log('Patched backend notifications.js');
