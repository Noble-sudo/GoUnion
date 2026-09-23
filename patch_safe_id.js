import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(/chat\.partner\.id/g, 'chat?.partner?.id');
c = c.replace(/chat\.id/g, 'chat?.id');
c = c.replace(/existingChat\.id/g, 'existingChat?.id');
c = c.replace(/activeChat\.partner\.id/g, 'activeChat?.partner?.id');
c = c.replace(/person\.id/g, 'person?.id');
c = c.replace(/msg\.id/g, 'msg?.id');
c = c.replace(/msg\.senderId/g, 'msg?.senderId');
c = c.replace(/msg\.replyToId/g, 'msg?.replyToId');
c = c.replace(/m\.id/g, 'm?.id');
c = c.replace(/newServerMsg\.id/g, 'newServerMsg?.id');
c = c.replace(/activeChat\.partner\.isGroup/g, 'activeChat?.partner?.isGroup');
c = c.replace(/activeChat\.partner\.username/g, 'activeChat?.partner?.username');
c = c.replace(/activeChat\.partner\.fullName/g, 'activeChat?.partner?.fullName');
c = c.replace(/activeChat\.partner\.avatarUrl/g, 'activeChat?.partner?.avatarUrl');

// Write back
fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched all .id to ?.id in Messages.jsx");
