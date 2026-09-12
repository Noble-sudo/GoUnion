import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Router } from 'express';
import { EmailVerificationToken, Follow, PendingSignup, Post, User } from '../models.js';
import { addNotification, publicUser, serializePost } from '../store.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { sendOtpEmail } from '../services/mail.js';

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
    await req.user.save();
    res.json(await publicUser(req.user, req.user.id));
  }),
);

usersRouter.get(
  '/suggestions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit || 50);
    const users = await User.find({ id: { $ne: req.user.id } }).limit(limit).sort({ created_at: -1 });
    res.json(await Promise.all(users.map((user) => publicUser(user, req.user.id))));
  }),
);

usersRouter.get(
  '/:id/posts',
  requireAuth,
  asyncHandler(async (req, res) => {
    const posts = await Post.find({ user_id: req.params.id, is_taken_down: { $ne: true } }).sort({ created_at: -1 }).limit(Number(req.query.limit || 50));
    res.json(await Promise.all(posts.map((post) => serializePost(post, req.user.id))));
  }),
);

usersRouter.post(
  '/:id/follow',
  requireAuth,
  asyncHandler(async (req, res) => {
    const target = await User.findOne({ id: req.params.id });
    if (!target) throw notFound('User not found.');
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
    const users = await User.find({ id: { $in: follows.map((follow) => follow.following_id) } });
    res.json(await Promise.all(users.map((user) => publicUser(user, req.user.id))));
  }),
);

usersRouter.get(
  '/:id/followers',
  requireAuth,
  asyncHandler(async (req, res) => {
    const follows = await Follow.find({ following_id: req.params.id }).lean();
    const users = await User.find({ id: { $in: follows.map((follow) => follow.follower_id) } });
    res.json(await Promise.all(users.map((user) => publicUser(user, req.user.id))));
  }),
);
