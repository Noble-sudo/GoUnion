import fs from 'fs';

let c = fs.readFileSync('backend/src/store.js', 'utf8');

const regex = /is_following: Boolean\(isFollowing\),\s*\};\s*\};/;

const newFields = `is_following: Boolean(isFollowing),
    ...(viewerId === plain.id ? {
      settings: plain.settings || {},
      blocked_users: plain.blocked_users || [],
      muted_conversations: plain.muted_conversations || [],
      is_banned: plain.is_banned || false,
      ban_reason: plain.ban_reason || null
    } : {
      is_banned: plain.is_banned || false
    })
  };
};`;

if (c.match(regex)) {
    c = c.replace(regex, newFields);
    fs.writeFileSync('backend/src/store.js', c);
    console.log("Patched publicUser in store.js");
} else {
    console.log("Regex not found in store.js!");
}
