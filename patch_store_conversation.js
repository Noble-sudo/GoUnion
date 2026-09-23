import fs from 'fs';

const lines = fs.readFileSync('backend/src/store.js', 'utf8').split(/\r?\n/);

const index = lines.findIndex(line => line.includes('participants: await Promise.all((conversation.participant_ids || []).map((id) => publicUser(id, viewerId))),'));

if (index !== -1) {
    const injected = `    let groupData = null;
    if (conversation.group_id) {
      const { Group } = await import('./models.js');
      const group = await Group.findOne({ id: conversation.group_id });
      if (group) groupData = group.toObject ? group.toObject() : group;
    }
    
    // Add groupData to return object
    conversation.group = groupData;
`;
    lines.splice(index - 1, 0, injected);
    fs.writeFileSync('backend/src/store.js', lines.join('\n'));
    console.log("Spliced correctly!");
} else {
    console.log("Line not found");
}
