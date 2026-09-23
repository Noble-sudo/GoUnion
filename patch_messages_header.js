const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const onlineTextMatch = /\{activeChat\.partner\.isOnline \? \([\s\S]*?\) : \(/;

const newOnlineText = `{activeChat.partner.isGroup ? (
    <span className="text-white/60 text-xs">
        {activeChat.participants?.length || 0} members,{' '}
        <span className="text-green-500 font-bold">{activeChat.participants?.filter(p => p.is_online || p.isOnline)?.length || 0} online</span>
    </span>
) : activeChat.partner.isOnline ? (
    <span className="text-green-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online</span>
) : activeChat.partner.lastSeen ? (
    <span className="text-white/40">Last seen {activeChat.partner.lastSeen}</span>
) : (`;

c = c.replace(onlineTextMatch, newOnlineText);

// Also fix the link: for groups it should be /groups/id, not /profile/group_name
c = c.replace(
    /<Link to=\{\`\/profile\/\$\{activeChat\.partner\.username\}\`\} className="min-w-0 flex-1">/g,
    '<Link to={activeChat.partner.isGroup ? `/groups/${activeChat.partner.id}` : `/profile/${activeChat.partner.username}`} className="min-w-0 flex-1">'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched group chat header online count');
