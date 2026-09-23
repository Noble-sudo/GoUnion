import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

if (!c.includes('blockUser:')) {
    const targetStr = `        search: async (q) => {
            const res = await apiClient.get(\`/users/search?q=\${encodeURIComponent(q)}\`);
            return Promise.all(res.data.map(transformUser));
        },`;
    
    const newStr = `        search: async (q) => {
            const res = await apiClient.get(\`/users/search?q=\${encodeURIComponent(q)}\`);
            return Promise.all(res.data.map(transformUser));
        },
        updateSettings: async (settings) => {
            const res = await apiClient.put('/users/me/settings', settings);
            return transformUser(res.data);
        },
        blockUser: async (userId) => {
            const res = await apiClient.post(\`/users/\${userId}/block\`);
            return transformUser(res.data.user);
        },
        unblockUser: async (userId) => {
            const res = await apiClient.post(\`/users/\${userId}/unblock\`);
            return res.data;
        },`;
    c = c.replace(targetStr, newStr);
    console.log("Injected blockUser into api.js");
}

fs.writeFileSync('frontend/services/api.js', c);
