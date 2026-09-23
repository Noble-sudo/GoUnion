const fs = require('fs');

let content = fs.readFileSync('frontend/components/admin/CampusManager.jsx', 'utf8');

content = content.replace(
  "{currentUser?.email === 'ezeilodavid292@gmail.com' && (",
  "{['admin', 'moderator'].includes(currentUser?.role) && ("
);

fs.writeFileSync('frontend/components/admin/CampusManager.jsx', content);
console.log('Patched CampusManager to allow all admins to teleport');
