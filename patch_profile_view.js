import fs from 'fs';

let content = fs.readFileSync('backend/src/routes/profiles.js', 'utf8');

content = content.replace(
  "import { User } from '../models.js';",
  "import { User, Notification } from '../models.js';"
);

content = content.replace(
  "import { publicUser } from '../store.js';",
  "import { publicUser, addNotification } from '../store.js';"
);

const getRoute = `profilesRouter.get(
  '/:username',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: new RegExp(\`^\${req.params.username}$\`, 'i') });
    if (!user) throw notFound('Profile not found.');
    
    // Add profile view notification logic
    if (user.id !== req.user.id) {
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
    
    res.json(await publicUser(user, req.user.id));
  }),
);`;

content = content.replace(/profilesRouter\.get\([\s\S]*?res\.json\(await publicUser\(user, req\.user\.id\)\);\s*\}\),\s*\);/, getRoute);

fs.writeFileSync('backend/src/routes/profiles.js', content);
console.log('Patched profiles.js for profile view notifications');
