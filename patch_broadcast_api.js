import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const replaceStr = `broadcast: async (payload) => {
            const res = await apiClient.post('/admin/broadcast', payload);
            return res.data;
        },
        toggleActive: async (userId) => {`;

c = c.replace('toggleActive: async (userId) => {', replaceStr);
fs.writeFileSync('frontend/services/api.js', c);
console.log('Added api.admin.broadcast to frontend!');
