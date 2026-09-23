import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

const regex = /groups: \{\s*getAll: async \(\) => \{[\s\S]*?getMembers: async \(id\) => \{/g;
const replacement = `groups: {
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
            const g = res.data;
            return {
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
            };
        },
        getMembers: async (id) => {`;

content = content.replace(regex, replacement);

fs.writeFileSync('frontend/services/api.js', content);
console.log('Fixed groups api methods in api.js');
