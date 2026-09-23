import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const newApiMethods = `
        createCampus: async (data) => {
            const res = await apiClient.post('/admin/institutions', data);
            return res.data;
        },
        updateCampus: async (id, data) => {
            const res = await apiClient.put(\`/admin/institutions/\${id}\`, data);
            return res.data;
        },
`;

c = c.replace(/broadcast: async \(payload\) => \{/, newApiMethods + '\n        broadcast: async (payload) => {');

fs.writeFileSync('frontend/services/api.js', c);
console.log('Added createCampus and updateCampus to api.js');
