const fs = require('fs');

let content = fs.readFileSync('frontend/components/admin/CampusManager.jsx', 'utf8');

content = content.replace(
  /u => u\.institutionId/g,
  `u => u.institution_id`
);

fs.writeFileSync('frontend/components/admin/CampusManager.jsx', content);
console.log('Fixed CampusManager filtering');
