const fs = require('fs');
let c = fs.readFileSync('frontend/components/layout/TopNav.jsx', 'utf8');

c = c.replace(
    /onClick: \(\) => setShowNotifications\(!showNotifications\)/,
    `onClick: () => navigate('/notifications')`
);

fs.writeFileSync('frontend/components/layout/TopNav.jsx', c);
console.log('Patched TopNav bell');
