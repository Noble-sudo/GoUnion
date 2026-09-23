import fs from 'fs';

// 1. Fix api.js
let apiSrc = fs.readFileSync('frontend/services/api.js', 'utf8');
if (!apiSrc.includes('leave: async')) {
    const targetGroups = `        getAll: async () => {`;
    const newGroups = `        leave: async (groupId) => {
            const res = await apiClient.post(\`/groups/\${groupId}/leave\`);
            return res.data;
        },
        getAll: async () => {`;
    apiSrc = apiSrc.replace(targetGroups, newGroups);
    fs.writeFileSync('frontend/services/api.js', apiSrc);
    console.log("Patched api.js groups leave");
}

// 2. Fix Messages.jsx API calls
let msgsSrc = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');
msgsSrc = msgsSrc.replace(/api\.chats\.leaveGroup/g, 'api.groups.leave');
msgsSrc = msgsSrc.replace(/api\.chats\.muteConversation/g, 'api.conversations.muteConversation');
msgsSrc = msgsSrc.replace(/api\.chats\.unmuteConversation/g, 'api.conversations.unmuteConversation');
fs.writeFileSync('frontend/pages/Messages.jsx', msgsSrc);
console.log("Patched Messages.jsx API references!");
