import fs from 'fs';
let file = fs.readFileSync('frontend/services/api.js', 'utf8');
file = file.replace(
  'isOnline: user.is_online ?? user.isOnline ?? profile.is_online ?? profile.isOnline ?? false,',
  'isOnline: user.is_online ?? user.isOnline ?? profile.is_online ?? profile.isOnline ?? true,'
);
file = file.replace(
  'lastSeen: formatLastSeen(user.last_seen || user.lastSeen || profile.last_seen || profile.lastSeen),',
  'lastSeen: formatLastSeen(user.last_seen || user.lastSeen || profile.last_seen || profile.lastSeen) || \'recently\','
);
fs.writeFileSync('frontend/services/api.js', file);
