const fs = require('fs');
let c = fs.readFileSync('backend/src/store.js', 'utf8');

c = c.replace(
    /participants: await Promise\.all\(\(conversation\.participant_ids \|\| \[\]\)\.map\(\(id\) => publicUser\(id, viewerId\)\)\),/,
    `participants: groupData 
        ? await Promise.all(((await (await import('./models.js')).GroupMember.find({ group_id: groupId })).map(m => m.user_id) || []).map(id => publicUser(id, viewerId)))
        : await Promise.all((conversation.participant_ids || []).map((id) => publicUser(id, viewerId))),`
);

fs.writeFileSync('backend/src/store.js', c);
console.log('Patched serializeConversation for group members');
