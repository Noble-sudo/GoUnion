import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const regexUsers = /updateProfile:\s*async\s*\([^)]*\)\s*=>\s*\{[^}]+\},/;
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
c = c.replace(regexUsers, newUsers);

const regexChats = /sendMessage:\s*async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\},/;
const newChatsMatch = c.match(regexChats);
if (newChatsMatch) {
    const newChats = newChatsMatch[0] + `
        muteConversation: async (conversationId) => {
            const res = await apiClient.post(\`/conversations/\${conversationId}/mute\`);
            return res.data;
        },
        unmuteConversation: async (conversationId) => {
            const res = await apiClient.post(\`/conversations/\${conversationId}/unmute\`);
            return res.data;
        },`;
    c = c.replace(newChatsMatch[0], newChats);
}

const transformUserRegex = /role:\s*user\.role,/;
const transformUserNew = `role: user.role,
        settings: user.settings || {},
        blockedUsers: user.blocked_users || [],
        mutedConversations: user.muted_conversations || [],
        isBanned: user.is_banned || false,`;
c = c.replace(transformUserRegex, transformUserNew);

fs.writeFileSync('frontend/services/api.js', c);
console.log("Patched api.js successfully!");
