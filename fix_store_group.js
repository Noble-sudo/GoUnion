import fs from 'fs';

let content = fs.readFileSync('backend/src/store.js', 'utf8');

const regex = /    let groupData = null;\r?\n    if \(conversation\.group_id\) \{\r?\n      const group = await Group\.findOne\(\{ id: conversation\.group_id \}\);\r?\n      if \(group\) groupData = group\.toObject \? group\.toObject\(\) : group;\r?\n    \}/;

const replacement = `    let groupData = null;
    let groupId = conversation.group_id;
    
    // Fallback: extract group ID from participant_key if group_id is missing from schema
    if (!groupId && conversation.participant_key && conversation.participant_key.startsWith('group_')) {
      groupId = conversation.participant_key.replace('group_', '');
    }

    if (groupId) {
      const group = await Group.findOne({ id: groupId });
      if (group) groupData = group.toObject ? group.toObject() : group;
    }`;

content = content.replace(regex, replacement);

fs.writeFileSync('backend/src/store.js', content);
console.log("Patched store.js to extract groupId from participant_key!");
