import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const regexUsers = /updateProfile: async \(data\) => \{\s*const res = await apiClient\.put\('\/users\/me\/profile', data\);\s*return transformUser\(res\.data\);\s*\},/;

const newUsers = `updateProfile: async (data) => {
            const res = await apiClient.put('/users/me/profile', data);
            return transformUser(res.data);
        },
        updateSettings: async (settings) => {
            const res = await apiClient.put('/users/me/settings', settings);
            return transformUser(res.data);
        },
        blockUser: async (userId) => {
            const res = await apiClient.post(\`/users/\${userId}/block\`);
            return res.data;
        },
        unblockUser: async (userId) => {
            const res = await apiClient.post(\`/users/\${userId}/unblock\`);
            return res.data;
        },`;

if (c.match(regexUsers)) {
    c = c.replace(regexUsers, newUsers);
} else {
    console.log("Could not find updateProfile in api.js");
}

const regexChats = /leaveGroup: async \(groupId\) => \{\s*const res = await apiClient\.post\(\`\/conversations\/groups\/\$\{groupId\}\/leave\`\);\s*return res\.data;\s*\},/;

const newChats = `leaveGroup: async (groupId) => {
            const res = await apiClient.post(\`/conversations/groups/\${groupId}/leave\`);
            return res.data;
        },
        muteConversation: async (conversationId) => {
            const res = await apiClient.post(\`/conversations/\${conversationId}/mute\`);
            return res.data;
        },
        unmuteConversation: async (conversationId) => {
            const res = await apiClient.post(\`/conversations/\${conversationId}/unmute\`);
            return res.data;
        },`;

if (c.match(regexChats)) {
    c = c.replace(regexChats, newChats);
} else {
    console.log("Could not find leaveGroup in api.js");
}

const transformUserRegex = /emailVerified: Boolean\(user\.email_verified\),\s*role: user\.role,/;

const transformUserNew = `emailVerified: Boolean(user.email_verified),
        role: user.role,
        settings: user.settings || {},
        blockedUsers: user.blocked_users || [],
        mutedConversations: user.muted_conversations || [],
        isBanned: user.is_banned || false,`;

if (c.match(transformUserRegex)) {
    c = c.replace(transformUserRegex, transformUserNew);
} else {
    console.log("Could not find transformUser regex");
}

fs.writeFileSync('frontend/services/api.js', c);
console.log("Patched frontend api.js successfully!");
