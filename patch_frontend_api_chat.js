import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

const newApiMethod = `getPosts: async (id) => {
            const res = await apiClient.get(\`/groups/\${id}/posts/\`);
            return res.data.map(transformPost);
        },
        getChat: async (id) => {
            const res = await apiClient.get(\`/groups/\${id}/chat\`);
            return res.data;
        },`;

content = content.replace(/getPosts: async \(id\) => \{[\s\S]*?return res\.data\.map\(transformPost\);\n        \},/m, newApiMethod);

fs.writeFileSync('frontend/services/api.js', content);
console.log('Added getChat to api.groups');
