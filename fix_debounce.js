import fs from 'fs';

let content = fs.readFileSync('backend/src/routes/profiles.js', 'utf8');

const debounceLogic = `
// Memory cache to prevent React StrictMode race conditions (double-firing in <10ms)
const viewDebounceCache = new Set();

profilesRouter.get(
  '/:username',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: new RegExp(\`^\${req.params.username}\$\`, 'i') });
    if (!user) throw notFound('Profile not found.');
    
    // Add profile view notification logic
    if (user.id !== req.user.id) {
      const viewKey = \`\${req.user.id}->\${user.id}\`;
      
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
`;

content = content.replace(
  /profilesRouter\.get\([\s\S]*?if \(!recentView\) \{[\s\S]*?await addNotification\(\{[\s\S]*?user_id: user\.id,[\s\S]*?sender_id: req\.user\.id,[\s\S]*?type: 'profile_view'[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?\}/,
  debounceLogic
);

fs.writeFileSync('backend/src/routes/profiles.js', content);
console.log('Added debounce cache to profiles.js');
