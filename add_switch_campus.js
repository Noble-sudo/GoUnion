const fs = require('fs');
let content = fs.readFileSync('frontend/services/api.js', 'utf8');

if (!content.includes('switchCampus: async')) {
  content = content.replace(
    /admin: \{/,
    `admin: {
        switchCampus: async (institution_id) => {
            const res = await apiClient.post('/admin/switch-campus', { institution_id });
            if (res.data.status === 'ok') {
                const userRes = await apiClient.get('/users/me/');
                const transformedUser = transformUser(userRes.data);
                localStorage.setItem('user_data', JSON.stringify(transformedUser));
            }
            return res.data;
        },`
  );
  fs.writeFileSync('frontend/services/api.js', content);
  console.log('Added switchCampus to api.admin');
}
