const fs = require('fs');

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

// The file looks like:
// export const api = {
//     admin: {
//         getAppeals: ...
//         resolveAppeal: ...
//     },
//     admin: {
//         getStats: ...
//     },

c = c.replace(/admin: \{\s*getAppeals:[\s\S]*?resolveAppeal:[\s\S]*?return res\.data;\s*\}\s*\},/, '');
c = c.replace(/admin: \{/, `admin: {
        getAppeals: async () => {
            const res = await apiClient.get('/admin/appeals');
            return res.data;
        },
        resolveAppeal: async (id, status) => {
            const res = await apiClient.post(\`/admin/appeals/\${id}/resolve\`, { status });
            return res.data;
        },`);

fs.writeFileSync('frontend/services/api.js', c);
console.log('Fixed api.js admin keys');
