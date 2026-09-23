import fs from 'fs';

let content = fs.readFileSync('backend/src/models.js', 'utf8');

// Add group_id to conversationSchema
const conversationRegex = /participant_ids: \{ type: \[String\], default: \[\], index: true \},\n\s*participant_key: \{ type: String, unique: true, sparse: true, index: true \},/;
const replacement = `participant_ids: { type: [String], default: [], index: true },
    participant_key: { type: String, unique: true, sparse: true, index: true },
    group_id: { type: String, default: null, index: true },`;

content = content.replace(conversationRegex, replacement);
fs.writeFileSync('backend/src/models.js', content);
console.log('Added group_id to Conversation schema');
