import fs from 'fs';

let content = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

// 1. Add Conversation to imports
if (!content.includes('Conversation')) {
    content = content.replace('GroupMember, GroupRequest }', 'GroupMember, GroupRequest, Conversation }');
}

// 2. Add GET /groups/:id/chat
const newRoute = `groupsRouter.get(
  '/:id/chat',
  requireAuth,
  asyncHandler(async (req, res) => {
    let conv = await Conversation.findOne({ group_id: req.params.id });
    if (!conv) {
      // Create it if it doesn't exist
      const group = await Group.findOne({ id: req.params.id });
      if (!group) throw notFound('Group not found');
      // Add all current members as participants
      const members = await GroupMember.find({ group_id: group.id });
      const participantIds = members.map(m => m.user_id);
      conv = await Conversation.create({
        name: group.name,
        group_id: group.id,
        participant_ids: participantIds,
        participant_key: 'group_' + group.id
      });
    } else {
      // Ensure the current user is a participant if they are a member
      const isMember = await GroupMember.exists({ group_id: req.params.id, user_id: req.user.id });
      if (isMember && !conv.participant_ids.includes(req.user.id)) {
        conv.participant_ids.push(req.user.id);
        await conv.save();
      }
    }
    res.json({ conversation_id: conv.id });
  })
);

groupsRouter.get(
  '/:id/members/',`;

content = content.replace("groupsRouter.get(\n  '/:id/members/',", newRoute);
// Fallback for Windows CRLF
content = content.replace("groupsRouter.get(\r\n  '/:id/members/',", newRoute);

fs.writeFileSync('backend/src/routes/groups.js', content);
console.log('Added GET /groups/:id/chat');
