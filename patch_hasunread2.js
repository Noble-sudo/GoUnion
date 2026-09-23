const fs = require('fs');

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /const hasUnread = messages\.some\(m => !m\.isRead && String\(m\.senderId\) !== String\(currentUserId\) && !m\.seenByUsers\?\.some\(seen => String\(seen\.user\?\.id \|\| seen\.userId\) === String\(currentUserId\)\)\);/g,
    `const hasUnread = messages.some(m => String(m.senderId) !== String(currentUserId) && !m.seenByUsers?.some(seen => String(seen.user?.id || seen.userId) === String(currentUserId)));`
);

c = c.replace(
    /return messages\.findIndex\(m => !m\.isRead && String\(m\.senderId\) !== String\(currentUserId\) && !m\.seenByUsers\?\.some\(seen => String\(seen\.user\?\.id \|\| seen\.userId\) === String\(currentUserId\)\)\);/g,
    `return messages.findIndex(m => String(m.senderId) !== String(currentUserId) && !m.seenByUsers?.some(seen => String(seen.user?.id || seen.userId) === String(currentUserId)));`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched hasUnread properly');
