import { Router } from 'express';
import { Conversation, Group, Message, User } from '../models.js';
import { addNotification, serializeConversation, serializeMessage, processMentions } from '../store.js';
import { getIo } from '../socket.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forbidden, notFound, HttpError } from '../utils/httpError.js';
import { assertSameInstitution } from '../utils/institutionScope.js';

export const conversationsRouter = Router();

conversationsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) throw notFound('Conversation not found.');
    if (!hasParticipant(conversation, req.user.id)) throw forbidden('You cannot delete this conversation.');
    
    await Conversation.updateOne({ id: req.params.id }, { $addToSet: { deleted_by: req.user.id } });
    res.json({ status: 'ok' });
  }),
);


const hasParticipant = (conversation, userId) => conversation?.participant_ids.includes(userId);
const participantKey = (participantIds) => [...new Set(participantIds.map(String))].sort().join(':');

conversationsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({ participant_ids: req.user.id, deleted_by: { $ne: req.user.id } }).sort({ updated_at: -1 });
    const serialized = await Promise.all(conversations.map((c) => serializeConversation(c, req.user.id)));
    serialized.sort((a, b) => new Date((b.messages.at(-1) || b).created_at) - new Date((a.messages.at(-1) || a).created_at));
    res.json(serialized);
  }),
);

conversationsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    
      const participantIds = Array.from(new Set([req.user.id, ...(req.body.participant_ids || []).map(String)]));
      
      // Ensure all participants belong to the same campus
      const usersToCheck = await User.find({ id: { $in: participantIds } });
      for (const p of usersToCheck) {
        if (p.id !== req.user.id) {
          assertSameInstitution(p, req.user, 'User');
        }
      }
      
      const key = participantKey(participantIds);

    const existing = await Conversation.findOne({
      $or: [
        { participant_key: key },
        { participant_ids: { $all: participantIds, $size: participantIds.length } },
      ],
    });
    if (existing) return res.json(await serializeConversation(existing, req.user.id));
    let conversation;
    try {
      conversation = await Conversation.create({ name: req.body.name || null, participant_ids: participantIds, participant_key: key });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      conversation = await Conversation.findOne({ participant_key: key });
      if (!conversation) throw error;
    }
    
    res.status(201).json(await serializeConversation(conversation, req.user.id));
  }),
);

conversationsRouter.get(
  '/:id/messages/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) throw notFound('Conversation not found.');
    if (!hasParticipant(conversation, req.user.id)) throw forbidden('You cannot view this conversation.');
    const messages = await Message.find({ conversation_id: conversation.id }).sort({ created_at: 1 });
    res.json(await Promise.all(messages.map(serializeMessage)));
  }),
);

conversationsRouter.post(
  '/:id/messages/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) throw notFound('Conversation not found.');
    if (!hasParticipant(conversation, req.user.id)) throw forbidden('You cannot message this conversation.');
    
    const partnerId = conversation.participant_ids.find(id => id !== req.user.id);
    if (partnerId) {
        const partner = await User.findOne({ id: partnerId });
        if (partner && partner.blocked_users && partner.blocked_users.includes(req.user.id)) {
            throw forbidden('You cannot send a message to this user.');
        }
        if (req.user.blocked_users && req.user.blocked_users.includes(partnerId)) {
            throw forbidden('You must unblock this user to send a message.');
        }
    }
    const message = await Message.create({
      conversation_id: conversation.id,
      sender_id: req.user.id,
      content: req.body.content || '',
      image_url: req.body.image_url || null,
      video_url: req.body.video_url || null,
      audio_url: req.body.audio_url || null,
      sticker_url: req.body.sticker_url || null,
      sticker_id: req.body.sticker_id || null,
        reply_to_id: req.body.reply_to_id || null,
        is_forwarded: req.body.is_forwarded || false,
        is_read: false,
    });
    conversation.updated_at = new Date();
    await conversation.save();
    
    const groupId = conversation.group_id || (conversation.participant_key?.startsWith('group_') ? conversation.participant_key.replace('group_', '') : null);
    const group = groupId ? await Group.findOne({ id: groupId }).select('name').lean() : null;
    const senderName = req.user.profile?.full_name || req.user.username || 'Someone';

    if (req.body.content) {
        await processMentions(req.body.content, req.user.id, {
          conversation_id: conversation.id,
          group_id: groupId,
          message: group ? `${group.name}: ${senderName} mentioned you.` : 'mentioned you in a chat.',
        });
    }
    await Promise.all(conversation.participant_ids.filter((id) => id !== req.user.id).map((id) => addNotification({
      user_id: id,
      sender_id: req.user.id,
      type: 'new_message',
      conversation_id: conversation.id,
      group_id: groupId,
      message: group ? `${group.name}: ${senderName} sent a message.` : null,
    })));
      // Emit socket event to participants
      try {
        const io = getIo();
        if (io) {
          const serialized = await serializeMessage(message);
          io.to(`conversation:${conversation.id}`).emit('new_message', { type: 'new_message', message: serialized });
          (conversation.participant_ids || []).forEach((pid) => {
            if (String(pid) !== String(req.user.id)) {
              io.to(`user:${pid}`).emit('new_message', { type: 'new_message', message: serialized });
            }
          });
        }
      } catch (e) {
        // ignore
      }

      res.status(201).json(await serializeMessage(message));
  }),
);

conversationsRouter.post(
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
            io.to(`user:${pid}`).emit('message_read', {
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
);



conversationsRouter.post(
  '/:id/mute',
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetId = String(req.params.id);
    await req.user.updateOne({ $addToSet: { muted_conversations: targetId } });
    res.json({ status: 'muted' });
  }),
);

conversationsRouter.post(
  '/:id/unmute',
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetId = String(req.params.id);
    await req.user.updateOne({ $pull: { muted_conversations: targetId } });
    res.json({ status: 'unmuted' });
  }),
);
