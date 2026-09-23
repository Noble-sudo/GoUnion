import { Router } from 'express';
import { Comment, Post, PostView, Group, GroupMember } from '../models.js';
import { addNotification, serializeComment, serializePost } from '../store.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError, forbidden, notFound } from '../utils/httpError.js';
import { notifyMentions } from '../utils/mentions.js';
import { getIo } from '../socket.js';
import { assertSameInstitution, institutionScopedQuery, userInstitutionId } from '../utils/institutionScope.js';

export const postsRouter = Router();

postsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const posts = await Post.find(institutionScopedQuery(req.user, { is_taken_down: { $ne: true } })).sort({ created_at: -1 }).skip(Number(req.query.skip || 0)).limit(Number(req.query.limit || 50));
    res.json(await Promise.all(posts.map((post) => serializePost(post, req.user.id))));
  }),
);

postsRouter.get(
  '/feed',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = req.query.reels === 'true'
      ? institutionScopedQuery(req.user, { video: { $nin: [null, ''] }, is_taken_down: { $ne: true } })
      : institutionScopedQuery(req.user, { is_taken_down: { $ne: true } });
    const posts = await Post.find(query).sort({ created_at: -1 }).skip(Number(req.query.skip || 0)).limit(Number(req.query.limit || 10));
    res.json(await Promise.all(posts.map((post) => serializePost(post, req.user.id))));
  }),
);

postsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { caption = '', image = null, video = null, group_id = null } = req.body;
    if (!caption && !image && !video) throw new HttpError(400, 'caption, image or video is required.');
    
    if (group_id) {
      const group = await Group.findOne({ id: group_id });
      if (group) assertSameInstitution(group, req.user, 'Circle');
      if (group && group.admins_only_chat) {
        const membership = await GroupMember.findOne({ group_id: group.id, user_id: req.user.id });
        const isManager = ['admin', 'moderator'].includes(req.user.role) || (membership && ['admin', 'moderator'].includes(membership.role));
        if (!isManager) {
          throw forbidden('Only admins can send messages in this group.');
        }
      }
    }

    const post = await Post.create({ institution_id: userInstitutionId(req.user), user_id: req.user.id, group_id: group_id ? String(group_id) : null, caption, image, video, likes: [] });
    await notifyMentions({
      text: caption,
      senderId: req.user.id,
      postId: post.id,
      groupId: group_id ? String(group_id) : null,
      message: group_id ? 'mentioned you in a circle post.' : null,
    });
    const serializedPost = await serializePost(post, req.user.id);
    
    if (group_id) {
      try {
        const io = getIo();
        if (io) {
          io.to(`group:${group_id}`).emit('new_group_message', {
            groupId: group_id,
            message: serializedPost
          });
        }
      } catch (e) {
        // ignore
      }

      // Notify all group members about the new post
      try {
        const group = await Group.findOne({ id: group_id });
        const members = await GroupMember.find({ group_id });
        const groupName = group?.name || 'a circle';
        await Promise.all(
          members
            .filter(m => String(m.user_id) !== String(req.user.id))
            .map(m => addNotification({
              user_id: m.user_id,
              sender_id: req.user.id,
              type: 'group_post',
              post_id: post.id,
              group_id: group_id,
              message: `posted in ${groupName}`,
            }))
        );
      } catch (e) {
        // ignore notification errors
      }
    }
    
    res.status(201).json(serializedPost);
  }),
);

postsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) throw notFound('Post not found.');
    assertSameInstitution(post, req.user, 'Drop');
    res.json(await serializePost(post, req.user.id));
  }),
);

postsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) throw notFound('Post not found.');
    assertSameInstitution(post, req.user, 'Drop');
    if (post.user_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) throw forbidden('You cannot delete this post.');
    await Post.deleteOne({ id: post.id });
    await Comment.deleteMany({ post_id: post.id });
    res.json({ status: 'deleted' });
  }),
);

postsRouter.post(
  '/:id/like',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) throw notFound('Post not found.');
    assertSameInstitution(post, req.user, 'Drop');
    if (post.likes.includes(req.user.id)) post.likes = post.likes.filter((id) => id !== req.user.id);
    else {
      post.likes.push(req.user.id);
      await addNotification({ user_id: post.user_id, sender_id: req.user.id, type: 'like', post_id: post.id });
    }
    await post.save();
    res.json({ status: 'ok', likes_count: post.likes.length });
  }),
);

postsRouter.get(
  '/:id/comments',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) throw notFound('Post not found.');
    assertSameInstitution(post, req.user, 'Drop');
    const comments = await Comment.find({ post_id: req.params.id }).sort({ created_at: 1 });
    res.json(await Promise.all(comments.map((comment) => serializeComment(comment, req.user.id))));
  }),
);

postsRouter.post(
  '/:id/comments/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) throw notFound('Post not found.');
    assertSameInstitution(post, req.user, 'Drop');
    if (!req.body.content) throw new HttpError(400, 'content is required.');
    const comment = await Comment.create({ user_id: req.user.id, post_id: post.id, content: req.body.content, likes: [] });
    await notifyMentions({
      text: req.body.content,
      senderId: req.user.id,
      postId: post.id,
      commentId: comment.id,
      groupId: post.group_id || null,
      message: post.group_id ? 'mentioned you in a circle comment.' : null,
    });
    await addNotification({ user_id: post.user_id, sender_id: req.user.id, type: 'comment', post_id: post.id, comment_id: comment.id });
    res.status(201).json(await serializeComment(comment, req.user.id));
  }),
);

postsRouter.post(
  '/:id/view',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) throw notFound('Post not found.');
    assertSameInstitution(post, req.user, 'Drop');
    await PostView.updateOne(
      { post_id: post.id, user_id: req.user.id },
      { $setOnInsert: { post_id: post.id, user_id: req.user.id } },
      { upsert: true },
    );
    res.json({ status: 'viewed', views_count: await PostView.countDocuments({ post_id: post.id }) });
  }),
);
