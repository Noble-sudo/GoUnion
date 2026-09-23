const fs = require('fs');
let c = fs.readFileSync('frontend/components/layout/TopNav.jsx', 'utf8');

c = c.replace(
    /const unreadCount = notifications\?\.filter\(\(n\) => !n\.read\)\.length \|\| 0;/,
    `const { data: unreadData } = useQuery({ queryKey: ["notifications-unread"], queryFn: api.notifications.getUnreadCount, enabled: !!user });\n    const unreadCount = unreadData?.count || 0;`
);

fs.writeFileSync('frontend/components/layout/TopNav.jsx', c);
console.log('Patched TopNav to use getUnreadCount');
