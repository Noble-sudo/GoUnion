import fs from 'fs';

let c = fs.readFileSync('backend/src/models.js', 'utf8');

const regex = /role: \{ type: String, enum: \['user', 'moderator', 'admin'\], default: 'user' \},[\s\S]*?is_banned: \{ type: Boolean, default: false \},/m;

const newStr = `role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
      profile: { type: profileSchema, default: () => ({}) },
      settings: {
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
      },
      blocked_users: [{ type: String, ref: 'User' }],
      muted_conversations: [{ type: String, ref: 'Conversation' }],
      is_banned: { type: Boolean, default: false },`;

if (c.match(regex)) {
    c = c.replace(regex, newStr);
    fs.writeFileSync('backend/src/models.js', c);
    console.log("Fixed models.js!");
} else {
    console.log("Regex not found!");
}
