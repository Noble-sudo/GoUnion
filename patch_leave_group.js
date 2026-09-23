import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

const target = `groupsRouter.get(
  '/:id/posts/',`;

const leaveRoute = `groupsRouter.post(
  '/:id/leave',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Group not found.');
    
    // Remove from GroupMember
    await GroupMember.deleteOne({ group_id: group.id, user_id: req.user.id });
    
    // Remove from Conversation participant_ids
    const conv = await Conversation.findOne({ group_id: group.id });
    if (conv) {
      conv.participant_ids = conv.participant_ids.filter(id => String(id) !== String(req.user.id));
      await conv.save();
    }
    
    const userName = req.user.profile?.full_name || req.user.username;
    await createGroupSystemMessage(group.id, \`\${userName} left the circle\`);
    
    res.json({ status: 'success' });
  })
);

`;

c = c.replace(target, leaveRoute + target);

fs.writeFileSync('backend/src/routes/groups.js', c);
console.log("Added /leave route to groups.js");
