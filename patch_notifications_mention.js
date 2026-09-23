const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

c = c.replace(
    /case 'mention': return "tagged you in a post or comment\.";/g,
    'case \'mention\': return notif && (notif.group_id || notif.groupId) ? "mentioned you in a group chat." : "tagged you in a post or comment.";'
);
// But wait! getMessageForType is outside the map loop and doesn't take `notif`.
// It takes `type`.
// Let's modify the map loop instead!
// {notif.message || getMessageForType(notif.type)}
c = c.replace(
    /\{notif\.message \|\| getMessageForType\(notif\.type\)\}/g,
    '{notif.message || (notif.type === "mention" && (notif.group_id || notif.groupId) ? "mentioned you in a group chat." : getMessageForType(notif.type))}'
);

fs.writeFileSync('frontend/pages/Notifications.jsx', c);
console.log('Patched Notifications.jsx mention text');
