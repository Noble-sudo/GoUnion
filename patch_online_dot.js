import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetStr = `<Avatar src={chat.partner.avatarUrl} alt={chat.partner.fullName} label={chat.partner.fullName} className="h-12 w-12 rounded-full object-cover bg-white/10 border border-white/10 relative" />`;

const newStr = `<div className="relative shrink-0">
                                            <Avatar src={chat.partner.avatarUrl} alt={chat.partner.fullName} label={chat.partner.fullName} className="h-12 w-12 rounded-full object-cover bg-white/10 border border-white/10" />
                                            {chat.partner.isOnline && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-[2.5px] border-[#0a0a0c]" />
                                            )}
                                        </div>`;

if (c.includes(targetStr)) {
    c = c.replace(targetStr, newStr);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Patched online dot in chat list");
} else {
    console.log("Target string not found in Messages.jsx!");
}
