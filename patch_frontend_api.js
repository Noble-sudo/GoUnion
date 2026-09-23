const fs = require('fs');

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

// Insert identities API inside `export const api = {`
const identityApi = `
    identities: {
        request: async (data) => {
            const res = await apiClient.post("/identities/request", data);
            return res.data;
        },
        changeCampus: async (identity_id) => {
            const res = await apiClient.post("/identities/change-campus", { identity_id });
            return res.data;
        },
        getMyIdentities: async () => {
            const res = await apiClient.get("/identities/me");
            return res.data;
        }
    },`;

content = content.replace(
  /export const api = \{/,
  `export const api = {${identityApi}`
);

fs.writeFileSync('frontend/services/api.js', content);
console.log('Frontend api.js patched with identities.');
