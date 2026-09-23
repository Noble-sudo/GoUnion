import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const target = `<Avatar src={msg.sender?.avatarUrl} alt={msg.sender?.fullName || "User"} label={msg.sender?.fullName || "U"} className="h-7 w-7 rounded-full shrink-0 border border-white/5 object-cover mb-6 bg-white/5" />`;

const replacement = `<Link to={msg.sender?.username ? \`/profile/\${msg.sender.username}\` : "#"} onClick={(e) => e.stopPropagation()} className="shrink-0 mb-6">
                                                                        <Avatar src={msg.sender?.avatarUrl} alt={msg.sender?.fullName || "User"} label={msg.sender?.fullName || "U"} className="h-7 w-7 rounded-full border border-white/5 object-cover bg-white/5 hover:scale-105 transition-transform" />
                                                                    </Link>`;

c = c.replace(target, replacement);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched avatar to Link");
