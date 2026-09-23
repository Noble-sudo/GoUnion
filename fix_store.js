import fs from 'fs';

let content = fs.readFileSync('backend/src/store.js', 'utf8');

const startStr = `  return {
    let groupData = null;
    if (conversation.group_id) {
      const { Group } = await import('./models.js');
      const group = await Group.findOne({ id: conversation.group_id });
      if (group) groupData = group.toObject ? group.toObject() : group;
    }
    
    // Add groupData to return object
    conversation.group = groupData;

    ...conversation,
    participants: await Promise.all((conversation.participant_ids || []).map((id) => publicUser(id, viewerId))),`;

const endStr = `    let groupData = null;
    if (conversation.group_id) {
      const group = await Group.findOne({ id: conversation.group_id });
      if (group) groupData = group.toObject ? group.toObject() : group;
    }

    return {
      ...conversation,
      group: groupData,
      participants: await Promise.all((conversation.participant_ids || []).map((id) => publicUser(id, viewerId))),`;

content = content.replace(/  return \{\r?\n    let groupData = null;[\s\S]*?\.\.\.conversation,\r?\n    participants: await Promise\.all\(\(conversation\.participant_ids \|\| \[\]\)\.map\(\(id\) => publicUser\(id, viewerId\)\)\),/m, endStr);

fs.writeFileSync('backend/src/store.js', content);
console.log("Fixed store.js syntax error manually!");
