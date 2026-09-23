const fs = require('fs');

let convCode = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

// Use a regex to match the entire /read route body
convCode = convCode.replace(
    /conversationsRouter\.post\(\s*'\/:id\/read'[\s\S]*?res\.json\(\{ status: 'success' \}\);\s*\}\),\s*\);/g,
    `conversationsRouter.post(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) throw notFound('Conversation not found.');
    if (!hasParticipant(conversation, req.user.id)) throw forbidden('You cannot read this conversation.');

    // Update seen_by array for read receipts and unread badge calculation
    await Message.updateMany(
      { 
        conversation_id: conversation.id, 
        sender_id: { $ne: req.user.id },
        'seen_by.user_id': { $ne: req.user.id }
      },
      { 
        $push: { seen_by: { user_id: req.user.id, seen_at: new Date() } }
      }
    );

    // Only set is_read globally if it's a direct message to support legacy 1-1 read receipts
    if (!conversation.group_id && !conversation.participant_key?.startsWith('group_')) {
        await Message.updateMany(
          { conversation_id: conversation.id, sender_id: { $ne: req.user.id }, is_read: false },
          { is_read: true }
        );
    }

    // Notify other participants via Socket.io so they get blue ticks (read receipts)
    try {
      const io = getIo();
      if (io) {
        (conversation.participant_ids || []).forEach((pid) => {
          if (String(pid) !== String(req.user.id)) {
            io.to(\`user:\${pid}\`).emit('message_read', {
              conversationId: conversation.id,
              readerId: req.user.id,
            });
          }
        });
      }
    } catch (e) {
      // ignore socket errors
    }

    res.json({ status: 'success' });
  }),
);`
);

fs.writeFileSync('backend/src/routes/conversations.js', convCode);
console.log('Patched conversations.js /read route correctly');
