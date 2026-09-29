import { Router } from 'express';
import { Group, Post, User } from '../models.js';
import { publicUser, serializeGroup, serializePost } from '../store.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { institutionScopedQuery } from '../utils/institutionScope.js';

export const searchRouter = Router();

const regex = (q) => new RegExp(String(q || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

searchRouter.get(
  '/users',
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = regex(req.query.q);
    const baseQuery = { id: { $ne: req.user.id }, $or: [{ username: q }, { email: q }, { 'profile.full_name': q }] };
    const query = req.query.scope === 'global' ? baseQuery : institutionScopedQuery(req.user, baseQuery);
    const users = await User.find(query).limit(50);
    res.json(await Promise.all(users.map((user) => publicUser(user, req.user.id))));
  }),
);

searchRouter.get(
  '/posts',
  requireAuth,
  asyncHandler(async (req, res) => {
    const baseQuery = { caption: regex(req.query.q), is_taken_down: { $ne: true }, group_id: null };
    const query = req.query.scope === 'global' ? baseQuery : institutionScopedQuery(req.user, baseQuery);
    const posts = await Post.find(query).sort({ created_at: -1 }).limit(50);
    res.json(await Promise.all(posts.map((post) => serializePost(post, req.user.id))));
  }),
);

searchRouter.get(
  '/groups',
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = regex(req.query.q);
    const baseQuery = { is_active: true, $or: [{ name: q }, { description: q }] };
    const query = req.query.scope === 'global' ? baseQuery : institutionScopedQuery(req.user, baseQuery);
    const groups = await Group.find(query).limit(50);
    res.json(await Promise.all(groups.map((group) => serializeGroup(group, req.user.id))));
  }),
);
