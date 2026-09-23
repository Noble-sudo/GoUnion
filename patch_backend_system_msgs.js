import fs from 'fs';

let content = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

// The original joins had:
// await Post.create({
//   user_id: 'system',
//   group_id: group.id,
//   caption: \`\${userName} joined the group\`,
// });
// 
// I need to find all Post.create inside groups.js and replace them with a function that gets the conversation and inserts a message.

const helperFunc = `
async function createGroupSystemMessage(groupId, caption) {
  try {
    let conv = await Conversation.findOne({ group_id: groupId });
    if (!conv) {
       // if group chat doesn't exist yet, we can silently skip or create it.
       const group = await Group.findOne({ id: groupId });
       if (!group) return;
       const members = await GroupMember.find({ group_id: group.id });
       conv = await Conversation.create({
         name: group.name,
         group_id: group.id,
         participant_ids: members.map(m => m.user_id),
         participant_key: 'group_' + group.id
       });
    }
    await Message.create({
      conversation_id: conv.id,
      sender_id: 'system',
      content: caption
    });
  } catch (e) {
    console.error("Failed to create system message:", e);
  }
}
`;

if (!content.includes('createGroupSystemMessage')) {
    content = content.replace("export const groupsRouter = Router();", helperFunc + "\nexport const groupsRouter = Router();");
}

// Replace Post.create for system messages
content = content.replace(/await Post\.create\(\{\s*user_id: 'system',\s*group_id: group\.id,\s*caption: `\$\{actorName\} changed the group subject to "\$\{group\.name\}"`,\s*\}\);/g, 
  'await createGroupSystemMessage(group.id, `${actorName} changed the group subject to "${group.name}"`);');

content = content.replace(/await Post\.create\(\{\s*user_id: 'system',\s*group_id: group\.id,\s*caption: `\$\{actorName\} changed this group's icon`,\s*\}\);/g, 
  'await createGroupSystemMessage(group.id, `${actorName} changed this group\\'s icon`);');

content = content.replace(/await Post\.create\(\{\s*user_id: 'system',\s*group_id: group\.id,\s*caption: `\$\{userName\} joined the group`,\s*\}\);/g, 
  'await createGroupSystemMessage(group.id, `${userName} joined the group`);');

content = content.replace(/await Post\.create\(\{\s*user_id: 'system',\s*group_id: request\.group_id,\s*caption: `\$\{userName\} joined the group`,\s*\}\);/g, 
  'await createGroupSystemMessage(request.group_id, `${userName} joined the group`);');

content = content.replace(/await Post\.create\(\{\s*user_id: 'system',\s*group_id: req\.params\.groupId,\s*caption: `\$\{targetName\} left the group`,\s*\}\);/g, 
  'await createGroupSystemMessage(req.params.groupId, `${targetName} left the group`);');

content = content.replace(/await Post\.create\(\{\s*user_id: 'system',\s*group_id: req\.params\.groupId,\s*caption: `\$\{targetName\} was removed by \$\{adminName\}`,\s*\}\);/g, 
  'await createGroupSystemMessage(req.params.groupId, `${targetName} was removed by ${adminName}`);');

fs.writeFileSync('backend/src/routes/groups.js', content);
console.log('Replaced system posts with system messages');
