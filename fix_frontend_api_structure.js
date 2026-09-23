import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

// 1. Fix the groups: { getAll... missing block
const getByIdRegex = /        getById: async \(id\) => \{\n            const res = await apiClient\.get\(`\/groups\/\$\{id\}`\);\n            const g = res\.data;/m;

const restoredGroups = `    groups: {
        getAll: async () => {
            const res = await apiClient.get('/groups/');
            return res.data.map((g) => ({
                id: g.id.toString(),
                name: g.name,
                description: g.description,
                memberCount: g.member_count || 0,
                imageUrl: getFullUrl(g.cover_image) || \`https://api.dicebear.com/7.x/identicon/svg?seed=\${g.name}\`,
                isJoined: g.is_joined ?? g.isJoined ?? false,
                privacy: g.privacy,
                creatorId: g.creator_id || g.creatorId,
                creator_id: g.creator_id || g.creatorId,
                has_requested: g.has_requested,
                category: g.category || 'Other',
            }));
        },
        getById: async (id) => {
            const res = await apiClient.get(\`/groups/\${id}\`);
            const g = res.data;`;

if (!content.includes('groups: {')) {
    content = content.replace(getByIdRegex, restoredGroups);
}

// 2. Add aliases and fixes to groups methods
// I need to find the bottom of the groups methods and make sure update, getChat, delete, leave(id, userId) are present
// Let's replace the updateGroup, leave, deleteGroup logic at the bottom of the groups block
const bottomRegex = /        updateGroup: async \(id, \{ name, description, privacy, file \} = \{\}\) => \{[\s\S]*?updateMemberRole: async \(groupId, userId, role\) => \{[\s\S]*?return res\.data;\n        \},\n        posts: async \(query\)/m;

const properBottom = `        update: async (id, data) => {
            let cover_url = undefined;
            if (data.file) {
                cover_url = await uploadFile(data.file);
            }
            const payload = {};
            if (data.name !== undefined) payload.name = data.name;
            if (data.description !== undefined) payload.description = data.description;
            if (data.privacy !== undefined) payload.privacy = data.privacy;
            if (data.category !== undefined) payload.category = data.category;
            if (cover_url !== undefined) payload.cover_image = cover_url;
            const res = await apiClient.put(\`/groups/\${id}\`, payload);
            return res.data;
        },
        getChat: async (id) => {
            const res = await apiClient.get(\`/groups/\${id}/chat\`);
            return res.data;
        },
        updateMemberRole: async (groupId, userId, role) => {
            const res = await apiClient.put(\`/groups/\${groupId}/members/\${userId}/role?role=\${role}\`);
            return res.data;
        },
        leave: async (groupId, userId = 'me') => {
            const res = await apiClient.delete(\`/groups/\${groupId}/members/\${userId}\`);
            return res.data;
        },
        delete: async (groupId) => {
            const res = await apiClient.delete(\`/groups/\${groupId}\`);
            return res.data;
        },
    },
    search: {
        users: async (query) => {
            const res = await apiClient.get(\`/search/users?q=\${encodeURIComponent(query)}\`);
            return res.data.map(transformUser);
        },
        posts: async (query)`;

content = content.replace(bottomRegex, properBottom);

fs.writeFileSync('frontend/services/api.js', content);
console.log("Restored api.js structure and added correct aliases!");
