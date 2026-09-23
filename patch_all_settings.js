import fs from 'fs';

// 1. Patch models.js
let modelsSrc = fs.readFileSync('backend/src/models.js', 'utf8');
const settingsRegex = /settings: \{[\s\S]*?\},/;
const newSettingsSchema = `settings: {
        email_notifications: { type: Boolean, default: true },
        push_notifications: { type: Boolean, default: true },
        marketing_emails: { type: Boolean, default: false },
        dark_mode: { type: Boolean, default: true },
        private_account: { type: Boolean, default: false },
        read_receipts: { type: Boolean, default: true },
        show_online_status: { type: Boolean, default: true },
        show_last_seen: { type: Boolean, default: true },
        allow_messages_anyone: { type: Boolean, default: true },
        show_in_suggestions: { type: Boolean, default: true },
        new_followers: { type: Boolean, default: true },
        direct_messages: { type: Boolean, default: true },
        post_likes: { type: Boolean, default: true },
        post_comments: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true }
    },`;
modelsSrc = modelsSrc.replace(settingsRegex, newSettingsSchema);
fs.writeFileSync('backend/src/models.js', modelsSrc);

// 2. Patch users.js routes
let usersSrc = fs.readFileSync('backend/src/routes/users.js', 'utf8');
const allowedSettingsRegex = /const allowedSettings = \[[^\]]*\];/;
const newAllowedSettings = `const allowedSettings = [
      'email_notifications', 'push_notifications', 'marketing_emails', 'dark_mode', 
      'private_account', 'read_receipts', 'show_online_status', 'show_last_seen',
      'allow_messages_anyone', 'show_in_suggestions', 'new_followers', 
      'direct_messages', 'post_likes', 'post_comments', 'mentions'
    ];`;
usersSrc = usersSrc.replace(allowedSettingsRegex, newAllowedSettings);
fs.writeFileSync('backend/src/routes/users.js', usersSrc);

console.log("Patched all missing settings!");
