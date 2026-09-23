import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
    /join: async \(id, data\) => \{\n\s*const res = await apiClient\.post\(\`\/groups\/\$\{id\}\/join\`, data\);\n\s*return res\.data;\n\s*\}/g,
    'join: async (id, data) => {\n            const res = await apiClient.post(`/groups/${id}/join`, data);\n            return res.data;\n        },\n        leave: async (id) => {\n            const res = await apiClient.post(`/groups/${id}/leave`);\n            return res.data;\n        }'
);

fs.writeFileSync('frontend/services/api.js', c);
console.log("Added api.groups.leave to api.js");
