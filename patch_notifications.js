const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

c = c.replace(
    /const targetPath = notif\.post_id/,
    `const isBroadcast = notif.type === 'broadcast';
          const targetPath = isBroadcast ? '#' : notif.post_id`
);

c = c.replace(
    /<Link to=\{targetPath\} onClick=\{\(\) => markOneReadMutation\.mutate\(String\(notif\.id\)\)\} className="flex-1 min-w-0">/,
    `<Link to={targetPath} onClick={(e) => { markOneReadMutation.mutate(String(notif.id)); if (isBroadcast) { e.preventDefault(); alert("Admin Broadcast:\\n\\n" + notif.message); } }} className="flex-1 min-w-0">`
);

fs.writeFileSync('frontend/pages/Notifications.jsx', c);
console.log('Patched Notifications.jsx to show broadcast alert');
