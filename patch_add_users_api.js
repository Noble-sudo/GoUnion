import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const target = 'export const api = {';
const usersObj = `
    users: {
        updateSettings: async (settings) => {
            const res = await apiClient.put('/users/me/settings', settings);
            return transformUser(res.data);
        },
        blockUser: async (userId) => {
            const res = await apiClient.post(\`/users/\${userId}/block\`);
            return res.data;
        },
        unblockUser: async (userId) => {
            const res = await apiClient.post(\`/users/\${userId}/unblock\`);
            return res.data;
        }
    },`;

if (c.includes(target)) {
    c = c.replace(target, target + usersObj);
    fs.writeFileSync('frontend/services/api.js', c);
    console.log("Added users object to api.js!");
} else {
    console.log("Could not find export const api");
}
