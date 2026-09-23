const fs = require('fs');
let apiJs = fs.readFileSync('frontend/services/api.js', 'utf8');

apiJs = apiJs.replace(
  '        getAll: async () => {\n            const res = await apiClient.get(\'/conversations/\');',
  '        delete: async (conversationId) => {\n            const res = await apiClient.delete(`/conversations/${conversationId}`);\n            return res.data;\n        },\n        getAll: async () => {\n            const res = await apiClient.get(\'/conversations/\');'
);

fs.writeFileSync('frontend/services/api.js', apiJs);
console.log('Patched api.chats.delete');
