import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/users.js', 'utf8');

const newRoutes = `

usersRouter.put(
  '/me/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user.settings) {
      req.user.settings = {};
    }
    const allowedSettings = ['email_notifications', 'push_notifications', 'marketing_emails', 'dark_mode', 'private_account', 'read_receipts'];
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
`;

c += newRoutes;
fs.writeFileSync('backend/src/routes/users.js', c);
console.log("Appended settings and block routes!");
