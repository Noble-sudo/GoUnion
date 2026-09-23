import fs from 'fs';
let content = fs.readFileSync('frontend/services/api.js', 'utf8');

// 1. Rename updateGroup to update
content = content.replace(/updateGroup: async \(id, \{ name, description, privacy, file \} = \{\}\) => \{/g, 'update: async (id, { name, description, privacy, file, category } = {}) => {');

// 2. Add category to payload
content = content.replace(/if \(privacy !== undefined\) payload\.privacy = privacy;/g, 'if (privacy !== undefined) payload.privacy = privacy;\n            if (category !== undefined) payload.category = category;');

// 3. Rename deleteGroup to delete
content = content.replace(/deleteGroup: async \(groupId\) => \{/g, 'delete: async (groupId) => {');

// 4. Change leave to accept userId and use DELETE endpoint
content = content.replace(/leave: async \(groupId\) => \{\n            const res = await apiClient\.post\(`\/groups\/\$\{groupId\}\/leave`\);\n            return res\.data;\n        \},/g, `leave: async (groupId, userId = 'me') => {
            const res = await apiClient.delete(\`/groups/\${groupId}/members/\${userId}\`);
            return res.data;
        },`);

// 5. Add getChat after getPosts
content = content.replace(/getPosts: async \(id\) => \{\s*const res = await apiClient\.get\(`\/groups\/\$\{id\}\/posts\/`\);\s*return res\.data\.map\(transformPost\);\s*\},/g, `getPosts: async (id) => {
            const res = await apiClient.get(\`/groups/\${id}/posts/\`);
            return res.data.map(transformPost);
        },
        getChat: async (id) => {
            const res = await apiClient.get(\`/groups/\${id}/chat\`);
            return res.data;
        },`);

fs.writeFileSync('frontend/services/api.js', content);
console.log("Patched API successfully!");
