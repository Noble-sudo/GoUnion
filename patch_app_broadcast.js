const fs = require('fs');
let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(
    /const actor = notification\.actor\?\.username \|\| notification\.actor\?\.fullName \|\| "Someone";/,
    `const actor = notification.type === 'broadcast' ? "Reconnected Broadcast" : (notification.actor?.username || notification.actor?.fullName || "Someone");`
);

c = c.replace(
    /const actorName = notif\?\.actor\?\.fullName \|\| notif\?\.actor\?\.username \|\| notif\?\.sender\?\.fullName \|\| notif\?\.sender\?\.username \|\| "Someone";/,
    `const actorName = notif?.type === 'broadcast' ? "Reconnected Broadcast" : (notif?.actor?.fullName || notif?.actor?.username || notif?.sender?.fullName || notif?.sender?.username || "Someone");`
);

c = c.replace(
    /let actionText = "sent you a notification\.";/g,
    `let actionText = notif?.type === 'broadcast' ? (notif.message || "sent a broadcast.") : "sent you a notification.";`
);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Patched App.jsx broadcast text');
