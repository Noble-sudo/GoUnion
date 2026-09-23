import fs from 'fs';

let content = fs.readFileSync('backend/src/models.js', 'utf8');

content = content.replace(/    participant_ids: \{ type: \[String\], default: \[\], index: true \},/, `    participant_ids: { type: [String], default: [], index: true },
    group_id: { type: String, default: null, index: true },`);

fs.writeFileSync('backend/src/models.js', content);
console.log("Added group_id to Conversation schema!");
