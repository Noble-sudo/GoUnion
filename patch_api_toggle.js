import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const replacement = "toggleActive: async (userId, reason = null) => {\n              const res = await apiClient.post(`/admin/users/${userId}/toggle-active`, { reason });\n              return res.data;\n          }";

c = c.replace(/toggleActive: async \(userId\) => \{\s*const res = await apiClient\.post\(`\/admin\/users\/\$\{userId\}\/toggle-active`\);\s*return res\.data;\s*\}/, replacement);

fs.writeFileSync('frontend/services/api.js', c);
console.log('Updated toggleActive in api.js');
