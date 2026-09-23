import fs from 'fs';

const lines = fs.readFileSync('frontend/services/api.js', 'utf8').split('\n');

const getByIdIndex = lines.findIndex(line => line.includes('getById: async (id) => {') && line.includes('const res = await apiClient.get(`/groups/${id}`);') === false);

// Wait, the line in api.js is just "        getById: async (id) => {"
// Let's find the one that is for groups.
const groupGetByIdIndex = lines.findIndex((line, i) => {
    return line.includes('getById: async (id) => {') && lines[i+1].includes('const res = await apiClient.get(`/groups/${id}`);');
});

if (groupGetByIdIndex !== -1) {
    // Before this line, there should be closing braces for the previous section (profiles).
    // Let's replace the single "        }," before it with the correct closing and groups: { getAll...
    const replaced = `            }
        }
    },
    groups: {
        getAll: async () => {
            const res = await apiClient.get('/groups/');
            return res.data.map((g) => ({
                id: g.id.toString(),
                name: g.name,
                description: g.description,
                memberCount: g.member_count || 0,
                imageUrl: getFullUrl(g.cover_image) || \\\`https://api.dicebear.com/7.x/identicon/svg?seed=\\\${g.name}\\\`,
                isJoined: g.is_joined ?? g.isJoined ?? false,
                privacy: g.privacy,
                creatorId: g.creator_id || g.creatorId,
                creator_id: g.creator_id || g.creatorId,
                has_requested: g.has_requested,
                category: g.category || 'Other',
            }));
        },
        getById: async (id) => {`;
    
    lines[groupGetByIdIndex - 1] = replaced;
    lines.splice(groupGetByIdIndex, 1); // remove the old getById
    fs.writeFileSync('frontend/services/api.js', lines.join('\n'));
    console.log("Spliced correctly!");
} else {
    console.log("Could not find group getById");
}
