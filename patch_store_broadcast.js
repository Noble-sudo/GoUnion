import fs from 'fs';

let c = fs.readFileSync('backend/src/store.js', 'utf8');

c = c.replace(
    /full_name: 'Reconnected Admin',/,
    `full_name: 'Reconnected Broadcast',`
);
c = c.replace(
    /avatar: 'https:\/\/api\.dicebear\.com\/7\.x\/identicon\/svg\?seed=ReconnectedAdmin',/,
    `avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=R&backgroundColor=ffffff&textColor=000000',`
);

fs.writeFileSync('backend/src/store.js', c);
console.log('Patched store.js to Reconnected Broadcast');
