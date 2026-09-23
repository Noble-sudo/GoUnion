import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
    'isActive: user.is_active ?? true,',
    `isActive: user.is_active ?? true,
        settings: user.settings || {},
        blockedUsers: user.blocked_users || [],
        mutedConversations: user.muted_conversations || [],
        isBanned: user.is_banned || false,`
);

fs.writeFileSync('frontend/services/api.js', c);
console.log("Patched transformUser completely!");
