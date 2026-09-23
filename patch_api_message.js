import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
    /senderId: String\(m\.sender_id \|\| m\.senderId\),/,
    `senderId: String(m.sender_id || m.senderId),
          sender: m.sender ? transformUser(m.sender) : null,`
);

fs.writeFileSync('frontend/services/api.js', c);
console.log('Patched transformMessage in api.js');
