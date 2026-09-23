import fs from 'fs';

let c = fs.readFileSync('backend/src/models.js', 'utf8');

const targetStr = `    profile: { type: profileSchema, default: () => ({}) },
  },`;

const newFields = `    profile: { type: profileSchema, default: () => ({}) },
    settings: {
        email_notifications: { type: Boolean, default: true },
        push_notifications: { type: Boolean, default: true },
        marketing_emails: { type: Boolean, default: false },
        dark_mode: { type: Boolean, default: true },
        private_account: { type: Boolean, default: false },
        read_receipts: { type: Boolean, default: true }
    },
    blocked_users: [{ type: String, ref: 'User' }],
    muted_conversations: [{ type: String, ref: 'Conversation' }],
    is_banned: { type: Boolean, default: false },
    ban_reason: { type: String, default: null },
  },`;

if (c.includes(targetStr)) {
    c = c.replace(targetStr, newFields);
    fs.writeFileSync('backend/src/models.js', c);
    console.log("Patched User model in models.js");
} else {
    console.log("User model target string not found");
}
