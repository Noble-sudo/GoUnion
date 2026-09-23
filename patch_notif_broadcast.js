const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

c = c.replace(
    /<span className="font-bold text-white \nhover:underline">\{notif\.actor\?\.fullName \|\| notif\.actor\?\.username\}<\/span>/,
    `<span className="font-bold text-white hover:underline">{notif.type === 'broadcast' ? "Reconnected Broadcast" : (notif.actor?.fullName || notif.actor?.username)}</span>`
);

c = c.replace(
    /<span className="font-bold text-white hover:underline">\{notif\.actor\?\.fullName \|\| notif\.actor\?\.username\}<\/span>/g,
    `<span className="font-bold text-white hover:underline">{notif.type === 'broadcast' ? "Reconnected Broadcast" : (notif.actor?.fullName || notif.actor?.username)}</span>`
);

// Wait, the message for broadcast includes the title and body like "Title: Body".
// Let's strip the title from the notification list view, or just leave it since the user hasn't explicitly asked.
// Actually, `notif.message` has the body.
// If type is broadcast, we shouldn't append `getMessageForType(notif.type)`.
// The user said: "it should be reconnected broad cast not admin broadcast or even reconnected admin"

fs.writeFileSync('frontend/pages/Notifications.jsx', c);
console.log('Patched Notifications.jsx name');
