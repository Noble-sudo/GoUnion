import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const target = `(activeChat?.partner?.fullName || "User")`;
const replacement = `(repliedMsg.sender?.fullName || (activeChat?.partner?.isGroup ? "Group Member" : activeChat?.partner?.fullName) || "User")`;

c = c.replace(target, replacement);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched reply name");
