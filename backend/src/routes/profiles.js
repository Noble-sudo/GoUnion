import { Router } from 'express';
import { User, Notification } from '../models.js';
import { publicUser, addNotification } from '../store.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notFound } from '../utils/httpError.js';
import { assertSameInstitution } from '../utils/institutionScope.js';

export const profilesRouter = Router();

// Memory cache to prevent React StrictMode race conditions (double-firing in <10ms)
const viewDebounceCache = new Set();

profilesRouter.get(
  '/:username',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: new RegExp(`^${req.params.username}$`, 'i') });
    if (!user) throw notFound('Profile not found.');
    assertSameInstitution(user, req.user, 'Profile');
    
    // Add profile view notification logic
    if (user.id !== req.user.id) {
      const viewKey = `${req.user.id}->${user.id}`;
      
      if (!viewDebounceCache.has(viewKey)) {
        viewDebounceCache.add(viewKey);
        // Clear from memory cache after 1 minute (DB handles the 24h check)
        setTimeout(() => viewDebounceCache.delete(viewKey), 60 * 1000);

        // Check if there was a recent profile_view from this user in the last 24h
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentView = await Notification.findOne({
          user_id: user.id,
          sender_id: req.user.id,
          type: 'profile_view',
          created_at: { $gte: oneDayAgo }
        });
        
        if (!recentView) {
          await addNotification({
            user_id: user.id,
            sender_id: req.user.id,
            type: 'profile_view'
          });
        }
      }
    }
    
    res.json(await publicUser(user, req.user.id));
  }),
);

profilesRouter.get(
  '/:username/followers',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: new RegExp(`^${req.params.username}$`, 'i') });
    if (!user) throw notFound('Profile not found.');
    // TODO: implement followers
    res.json([]);
  }),
);

profilesRouter.get(
  '/:username/following',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: new RegExp(`^${req.params.username}$`, 'i') });
    if (!user) throw notFound('Profile not found.');
    // TODO: implement following
    res.json([]);
  }),
);
