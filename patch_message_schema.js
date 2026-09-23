import fs from 'fs';

let content = fs.readFileSync('backend/src/models.js', 'utf8');

const regex = /      is_read: \{ type: Boolean, default: false \},/;
const replacement = `      is_read: { type: Boolean, default: false },
      seen_by: { 
        type: [{
          user_id: { type: String, required: true },
          seen_at: { type: Date, default: Date.now }
        }], 
        default: [] 
      },`;

content = content.replace(regex, replacement);

fs.writeFileSync('backend/src/models.js', content);
console.log("Patched messageSchema with seen_by array!");
