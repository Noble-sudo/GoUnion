const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const oldAvatarBlock = `    {(!mine && activeChat?.partner?.isGroup && !isConsecutive) && (
          <div className="flex items-center gap-2 mb-1 ml-1">
              <Avatar src={msg.sender?.avatarUrl} alt={msg.sender?.fullName} label={msg.sender?.fullName} className="w-5 h-5 rounded-full object-cover bg-white/10" />
              <span className="text-[11px] font-bold text-white/60">{msg.sender?.fullName || 'User'}</span>
          </div>
      )}`;

const newAvatarBlock = `
    {(!mine && activeChat?.partner?.isGroup) && (
        <Link to={\`/profile/\${msg.sender?.username}\`} className="mr-2 mt-auto shrink-0 flex items-end">
            {!isConsecutive ? (
                <Avatar src={msg.sender?.avatarUrl} label={msg.sender?.fullName} className="w-6 h-6 rounded-full object-cover bg-white/10 border border-white/5" />
            ) : (
                <div className="w-6 h-6" />
            )}
        </Link>
    )}
    <div className={\`flex flex-col gap-1 w-full max-w-full \${mine ? "items-end" : "items-start"}\`}>
        {(!mine && activeChat?.partner?.isGroup && !isConsecutive) && (
            <span className="text-[12px] font-bold ml-1 mb-0.5" style={{ color: getUserColor(msg.sender?.id) }}>{msg.sender?.fullName || 'User'}</span>
        )}
`;

// I need to find how it currently looks in Messages.jsx:
// <div className={`flex max-w-[82%] flex-col gap-1 sm:max-w-[70%] ${mine ? "items-end" : "items-start"}`}>
//       {(!mine && activeChat?.partner?.isGroup && !isConsecutive) && (
//           <div className="flex items-center gap-2 mb-1 ml-1">
//               <Avatar src={msg.sender?.avatarUrl} alt={msg.sender?.fullName} label={msg.sender?.fullName} className="w-5 h-5 rounded-full object-cover bg-white/10" />
//               <span className="text-[11px] font-bold text-white/60">{msg.sender?.fullName || 'User'}</span>
//           </div>
//       )}

c = c.replace(
    /<div className=\{\`flex max-w-\[82%\] flex-col gap-1 sm:max-w-\[70%\] \$\{mine \? "items-end" : "items-start"\}\`\}>\n\s*\{\(\!mine && activeChat\?\.partner\?\.isGroup && \!isConsecutive\) && \(\n\s*<div className="flex items-center gap-2 mb-1 ml-1">\n\s*<Avatar src=\{msg\.sender\?\.avatarUrl\} alt=\{msg\.sender\?\.fullName\} label=\{msg\.sender\?\.fullName\} className="w-5 h-5 rounded-full object-cover bg-white\/10" \/>\n\s*<span className="text-\[11px\] font-bold text-white\/60">\{msg\.sender\?\.fullName \|\| 'User'\}<\/span>\n\s*<\/div>\n\s*\)\}/,
    `<div className={\`flex max-w-[82%] sm:max-w-[70%]\`}>` + newAvatarBlock
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched layout for avatars');
