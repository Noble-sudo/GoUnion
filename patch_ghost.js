const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

const oldLogic = `groupsRouter.post(
    '/:id/leave',
    requireAuth,
    asyncHandler(async (req, res) => {
      const group = await Group.findOne({ id: req.params.id });
      if (!group) throw notFound('Group not found.');
      // Allow leaving regardless of institution scope
      
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
  );`;

const newLogic = `groupsRouter.post(
    '/:id/leave',
    requireAuth,
    asyncHandler(async (req, res) => {
      const groupId = req.params.id;
      
      // Remove from GroupMember regardless of whether group exists
      await GroupMember.deleteOne({ group_id: groupId, user_id: req.user.id });
      
      // Remove from Conversation participant_ids
      const conv = await Conversation.findOne({ group_id: groupId });
      if (conv) {
        conv.participant_ids = conv.participant_ids.filter(id => String(id) !== String(req.user.id));
        await conv.save();
      }
      
      const group = await Group.findOne({ id: groupId });
      if (group) {
        const userName = req.user.profile?.full_name || req.user.username;
        await createGroupSystemMessage(group.id, \`\${userName} left the circle\`);
      }
      
      res.json({ status: 'success' });
    })
  );`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('backend/src/routes/groups.js', content);
console.log("Patched ghost group leave logic");
