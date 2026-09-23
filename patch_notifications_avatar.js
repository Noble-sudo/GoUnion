const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

c = c.replace(
    /<Link to=\{\`\/profile\/\$\{notif\.actor\?\.username\}\`\} className="relative shrink-0">/,
    `{notif.actor?.id === 'system' || notif.type === 'broadcast' ? (
        <div className="relative shrink-0 w-12 h-12 rounded-xl bg-white flex items-center justify-center">
            <span className="text-[#0a0a0c] font-black text-xl font-serif">R</span>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0a0a0c] rounded-full flex items-center justify-center">
                {getIconForType(notif.type)}
            </div>
        </div>
    ) : (
        <Link to={\`/profile/\${notif.actor?.username}\`} className="relative shrink-0">`
);

c = c.replace(
    /<\/Link>\n\s*<Link to=\{targetPath\} onClick=\{\(e\)/,
    `</Link>\n                                  )}\n                                  <Link to={targetPath} onClick={(e)`
);

fs.writeFileSync('frontend/pages/Notifications.jsx', c);
console.log('Patched Notifications.jsx for broadcast avatar');
