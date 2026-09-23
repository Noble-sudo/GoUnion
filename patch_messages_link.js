import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const regex = /<Link to=\{`\/profile\/\$\{activeChat\.partner\.username\}`\} className="min-w-0 flex-1">/;
const replacement = `<Link to={activeChat.partner.isGroup ? \`/groups/\${activeChat.partner.id}\` : \`/profile/\${activeChat.partner.username}\`} className="min-w-0 flex-1">`;

content = content.replace(regex, replacement);
fs.writeFileSync('frontend/pages/Messages.jsx', content);
console.log("Patched profile link in Messages.jsx!");
