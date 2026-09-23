import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const target = `join: async (id, data) => {
            const res = await apiClient.post(\`/groups/\${id}/join\`, data);
            return res.data;
        },`;
        
const replacement = `join: async (id, data) => {
            const res = await apiClient.post(\`/groups/\${id}/join\`, data);
            return res.data;
        },
        leave: async (id) => {
            const res = await apiClient.post(\`/groups/\${id}/leave\`);
            return res.data;
        },`;

if (c.includes(target)) {
    c = c.replace(target, replacement);
    fs.writeFileSync('frontend/services/api.js', c);
    console.log("Added api.groups.leave");
} else {
    console.log("Target not found");
}
