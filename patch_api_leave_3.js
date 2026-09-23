import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
    'getRequests: async (id) => {',
    'leave: async (id) => {\n            const res = await apiClient.post(`/groups/${id}/leave`);\n            return res.data;\n        },\n        getRequests: async (id) => {'
);

fs.writeFileSync('frontend/services/api.js', c);
console.log("Added api.groups.leave");
