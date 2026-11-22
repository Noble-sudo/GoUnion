import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Router } from 'express';
import { Comment, Conversation, Follow, GroupEvent, GroupMember, GroupRequest, Message, Notification, OtpToken, PasswordResetToken, EmailVerificationToken, PendingSignup, Post, PostView, PushSubscription, RefreshToken, Story, StoryLike, StoryView, StudentIdentity, CampusXP, CampusStreak, User } from '../models.js';
import { Product, Shop } from '../shopModels.js';
import { addNotification, publicUser, serializePost, serializePosts } from '../store.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { sendOtpEmail } from '../services/mail.js';
import { assertSameInstitution, institutionScopedQuery, resolveInstitutionSelection } from '../utils/institutionScope.js';

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

export const usersRouter = Router();

usersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { username, email, password, full_name } = req.body;
    if (!username || !email || !password) throw new HttpError(400, 'username, email and password are required.');

    const normalizedEmail = String(email).toLowerCase();
    if (await User.exists({ email: normalizedEmail })) throw new HttpError(409, 'Email already registered.');
    if (await User.exists({ username })) throw new HttpError(409, 'Username already taken.');

    const password_hash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    
    // Upsert: resubmitting the form (e.g. OTP never arrived) just resets the code
    // instead of creating duplicate pending entries.
    await PendingSignup.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        username,
        password_hash,
        full_name: full_name || username,
        
        otp_hash: hashOtp(otp),
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      },
      { upsert: true, setDefaultsOnInsert: true },
    );

    const mailResult = await sendOtpEmail({ email: normalizedEmail }, otp);

    res.status(201).json({
      status: 'pending_verification',
      email: normalizedEmail,
      ...(mailResult.devCode ? { dev_code: mailResult.devCode } : {}),
    });
  }),
);

usersRouter.get(
  '/me/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await publicUser(req.user, req.user.id));
  }),
);

usersRouter.put(
  '/me/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    // If username is provided, validate uniqueness and update it
    if (req.body.username !== undefined && req.body.username !== req.user.username) {
      const trimmedUsername = req.body.username.trim();
      if (!trimmedUsername) {
        throw new HttpError(400, 'Username cannot be empty.');
      }
      const existing = await User.findOne({ username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') } });
      if (existing && existing.id !== req.user.id) {
        throw new HttpError(400, 'Username is already taken.');
      }
      req.user.username = trimmedUsername;
    }

    const allowed = ['bio', 'university', 'profile_picture', 'cover_photo', 'course', 'hometown', 'full_name'];
    for (const key of allowed) if (req.body[key] !== undefined) req.user.profile[key] = req.body[key];
    if (req.body.university !== undefined) {
      req.user.profile.university = req.body.university;
    }
    await req.user.save();
    res.json(await publicUser(req.user, req.user.id));
  }),
);

// Delete my own account. Needs the password. Removes the person's data, then the account itself last
// (so if anything fails half way, they can simply try again).
usersRouter.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const password = String(req.body?.password || '');
    if (!password) throw new HttpError(400, 'Please enter your password to delete your account.');
    if (['admin', 'moderator'].includes(req.user.role)) {
      throw new HttpError(403, 'Admin accounts cannot be deleted from the app.');
    }
    const ok = await bcrypt.compare(password, req.user.password_hash);
    if (!ok) throw new HttpError(401, 'That password is not correct.');

    const uid = req.user.id;

    // Posts, comments and views
    const myPosts = await Post.find({ user_id: uid }).select('id').lean();
    const myPostIds = myPosts.map((p) => p.id);
    await Comment.deleteMany({ $or: [{ user_id: uid }, { post_id: { $in: myPostIds } }] });
    await PostView.deleteMany({ $or: [{ user_id: uid }, { post_id: { $in: myPostIds } }] });
    await Post.deleteMany({ user_id: uid });
    await Post.updateMany({ likes: uid }, { $pull: { likes: uid } });
    await Comment.updateMany({ likes: uid }, { $pull: { likes: uid } });

    // Stories
    const myStories = await Story.find({ user_id: uid }).select('id').lean();
    const myStoryIds = myStories.map((s) => s.id);
    await StoryView.deleteMany({ $or: [{ user_id: uid }, { story_id: { $in: myStoryIds } }] });
    await StoryLike.deleteMany({ $or: [{ user_id: uid }, { story_id: { $in: myStoryIds } }] });
    await Story.deleteMany({ user_id: uid });

    // Messages: private chats are removed. In group chats the person leaves and their messages are blanked.
    const chats = await Conversation.find({ participant_ids: uid }).select('id group_id participant_ids').lean();
    const privateChatIds = chats.filter((c) => !c.group_id && (c.participant_ids || []).length <= 2).map((c) => c.id);
    await Message.deleteMany({ conversation_id: { $in: privateChatIds } });
    await Conversation.deleteMany({ id: { $in: privateChatIds } });
    await Message.updateMany(
      { sender_id: uid },
      { $set: { content: '', image_url: null, video_url: null, audio_url: null, sticker_url: null, sticker_id: null, is_deleted: true } },
    );
    await Conversation.updateMany({ participant_ids: uid }, { $pull: { participant_ids: uid } });

    // Followers, groups, notifications
    await Follow.deleteMany({ $or: [{ follower_id: uid }, { following_id: uid }] });
    await GroupMember.deleteMany({ user_id: uid });
    await GroupRequest.deleteMany({ user_id: uid });
    await GroupEvent.updateMany({ attendees: uid }, { $pull: { attendees: uid } });
    await Notification.deleteMany({ $or: [{ user_id: uid }, { sender_id: uid }] });

    // Teaky shop
    await Product.deleteMany({ owner_id: uid });
    await Shop.deleteMany({ owner_id: uid });

    // Sign-in records, tokens, push token, campus data
    await RefreshToken.deleteMany({ user_id: uid });
    await PasswordResetToken.deleteMany({ user_id: uid });
    await EmailVerificationToken.deleteMany({ user_id: uid });
    await OtpToken.deleteMany({ user_id: uid });
    await PushSubscription.deleteMany({ user_id: uid });
    await StudentIdentity.deleteMany({ user_id: uid });
    await CampusXP.deleteMany({ user_id: uid });
    await CampusStreak.deleteMany({ user_id: uid });
    await PendingSignup.deleteMany({ email: req.user.email });

    // Other people who had blocked this person no longer need the entry
    await User.updateMany({ blocked_users: uid }, { $pull: { blocked_users: uid } });

    // Reports and moderation records are kept on purpose (see the privacy page).
    await User.deleteOne({ id: uid });

    res.json({ status: 'deleted' });
  }),
);

usersRouter.get(
  '/suggestions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit || 50);
    const users = await User.find(institutionScopedQuery(req.user, {
        id: { $ne: req.user.id },
      })).limit(limit).sort({ created_at: -1 });
    res.json(await Promise.all(users.map((user) => publicUser(user, req.user.id))));
  }),
);

usersRouter.get(
  '/:id/posts',
  requireAuth,
  asyncHandler(async (req, res) => {
    const target = await User.findOne({ id: req.params.id });
    if (!target) throw notFound('User not found.');
    // Profiles are globally visible (Konnect)
    const posts = await Post.find({ user_id: req.params.id, is_taken_down: { $ne: true } }).sort({ created_at: -1 }).limit(Number(req.query.limit || 50));
    res.json(await serializePosts(posts, req.user.id));
  }),
);

usersRouter.post(
  '/:id/follow',
  requireAuth,
  asyncHandler(async (req, res) => {
    const target = await User.findOne({ id: req.params.id });
    if (!target) throw notFound('User not found.');
    // Following is globally allowed (Konnect)
    if (target.id !== req.user.id) {
      await Follow.updateOne({ follower_id: req.user.id, following_id: target.id }, { $setOnInsert: { follower_id: req.user.id, following_id: target.id } }, { upsert: true });
      await addNotification({ user_id: target.id, sender_id: req.user.id, type: 'follow' });
    }
    res.json({ status: 'following', user: await publicUser(target, req.user.id) });
  }),
);

usersRouter.post(
  '/:id/unfollow',
  requireAuth,
  asyncHandler(async (req, res) => {
    await Follow.deleteOne({ follower_id: req.user.id, following_id: req.params.id });
    res.json({ status: 'unfollowed' });
  }),
);

usersRouter.get(
  '/:id/following',
  requireAuth,
  asyncHandler(async (req, res) => {
    const follows = await Follow.find({ follower_id: req.params.id }).lean();
    const users = await User.find({
      id: { $in: follows.map((follow) => follow.following_id) },
      institution_id: req.user.institution_id || { $in: [null, ''] },
    });
    res.json(await Promise.all(users.map((user) => publicUser(user, req.user.id))));
  }),
);

usersRouter.get(
  '/:id/followers',
  requireAuth,
  asyncHandler(async (req, res) => {
    const follows = await Follow.find({ following_id: req.params.id }).lean();
    const users = await User.find({
      id: { $in: follows.map((follow) => follow.follower_id) },
      institution_id: req.user.institution_id || { $in: [null, ''] },
    });
    res.json(await Promise.all(users.map((user) => publicUser(user, req.user.id))));
  }),
);


usersRouter.put(
  '/me/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user.settings) {
      req.user.settings = {};
    }
    const allowedSettings = [
      'email_notifications', 'push_notifications', 'marketing_emails', 'dark_mode', 
      'private_account', 'read_receipts', 'show_online_status', 'show_last_seen',
      'allow_messages_anyone', 'show_in_suggestions', 'new_followers', 
      'direct_messages', 'post_likes', 'post_comments', 'mentions'
    ];
    for (const key of allowedSettings) {
      if (req.body[key] !== undefined) {
        req.user.settings[key] = req.body[key];
      }
    }
    await req.user.save();
    res.json(await publicUser(req.user, req.user.id));
  }),
);

usersRouter.post(
  '/:id/block',
  requireAuth,
  asyncHandler(async (req, res) => {
    const target = await User.findOne({ id: req.params.id });
    if (!target) throw notFound('User not found.');
    if (target.id === req.user.id) throw new HttpError(400, 'You cannot block yourself.');
    
    if (!req.user.blocked_users.includes(target.id)) {
      req.user.blocked_users.push(target.id);
      await req.user.save();
    }
    
    // Also remove from following/followers
    await Follow.deleteMany({
      $or: [
        { follower_id: req.user.id, following_id: target.id },
        { follower_id: target.id, following_id: req.user.id }
      ]
    });
    
    res.json({ status: 'blocked', user: await publicUser(target, req.user.id) });
  }),
);

usersRouter.post(
  '/:id/unblock',
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetId = String(req.params.id);
    req.user.blocked_users = req.user.blocked_users.filter(id => id !== targetId);
    await req.user.save();
    res.json({ status: 'unblocked' });
  }),
);
