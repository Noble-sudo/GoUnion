import { Router } from 'express';
import { Report, Message, Conversation } from '../models.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const reportsRouter = Router();

reportsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const postId = req.body.postId ?? req.body.post_id;
    const commentId = req.body.commentId ?? req.body.comment_id;
    const messageId = req.body.messageId ?? req.body.message_id;
    if (!req.body.reason) throw new HttpError(400, 'reason is required.');

    let messageFields = {};
    if (messageId) {
      const message = await Message.findOne({ id: String(messageId) });
      if (!message) throw new HttpError(404, 'Message not found.');
      const conversation = await Conversation.findOne({ id: message.conversation_id });
      const members = ((conversation && conversation.participant_ids) || []).map(String);
      if (!members.includes(String(req.user.id))) throw new HttpError(403, 'You cannot report this message.');
      if (String(message.sender_id) === String(req.user.id)) throw new HttpError(400, 'You cannot report your own message.');
      const parts = [];
      if (!message.is_deleted) {
        if (message.content) parts.push(String(message.content));
        ['image_url', 'video_url', 'audio_url', 'sticker_url'].forEach((f) => {
          if (message[f]) parts.push('[' + f.replace('_url', '') + '] ' + message[f]);
        });
      }
      messageFields = {
        message_id: String(message.id),
        reported_user_id: String(message.sender_id),
        message_snapshot: parts.join('\n').slice(0, 1500)
      };
    }

    const report = await Report.create({
      reason: req.body.reason,
      user_id: req.user.id,
      post_id: postId ? String(postId) : null,
      comment_id: commentId ? String(commentId) : null,
      ...messageFields,
      status: 'pending',
    });
    res.status(201).json(report.toObject());
  }),
);
