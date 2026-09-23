const fs = require('fs');

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

const adminIdentityApi = `
        getPendingIdentities: async () => {
            const res = await apiClient.get("/admin/identities");
            return res.data;
        },
        resolveIdentity: async (id, action) => {
            const res = await apiClient.post(\`/admin/identities/\${id}/\${action}\`);
            return res.data;
        },`;

content = content.replace(
  /updateCampus: async \(id, data\) => \{/,
  `${adminIdentityApi}\n        updateCampus: async (id, data) => {`
);

fs.writeFileSync('frontend/services/api.js', content);
console.log('Admin API patched.');
