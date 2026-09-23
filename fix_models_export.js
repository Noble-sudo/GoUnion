const fs = require('fs');

let c = fs.readFileSync('backend/src/models.js', 'utf8');

const eventSchema = `
const groupEventSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    group_id: { type: String, required: true, index: true },
    creator_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    start_time: { type: Date, required: true },
    end_time: { type: Date, default: null },
    cover_image: { type: String, default: null },
    attendees: [{ type: String }],
  },
  { versionKey: false }
);
`;

if (!c.includes('groupEventSchema')) {
  // insert schema before exports
  c = c.replace(/export const User =/g, eventSchema + '\nexport const User =');
  // insert export
  c = c.replace(/export const GroupMember = models\.GroupMember \|\| model\('GroupMember', groupMemberSchema\);/, `export const GroupMember = models.GroupMember || model('GroupMember', groupMemberSchema);\nexport const GroupEvent = models.GroupEvent || model('GroupEvent', groupEventSchema);`);
  fs.writeFileSync('backend/src/models.js', c);
  console.log('Added GroupEvent to models.js');
}
