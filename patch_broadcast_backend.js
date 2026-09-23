import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/admin.js', 'utf8');

const broadcastRoute = `
adminRouter.post(
  '/broadcast',
  asyncHandler(async (req, res) => {
    const { title, message, audience, institution_id } = req.body;
    if (!title || !message) throw notFound('Title and message are required.');

    let query = {};
    if (audience === 'campus' && institution_id) {
      query = { institution_id };
    }

    // Get all matching users
    const users = await User.find(query).select('id').lean();
    
    // Create notifications for all of them
    const notifications = users.map(u => ({
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      user_id: u.id,
      sender_id: req.user.id,
      type: 'broadcast',
      message: \`\${title}: \${message}\`,
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Insert in batches of 1000
    const NotificationModel = (await import('../models.js')).Notification;
    for (let i = 0; i < notifications.length; i += 1000) {
      await NotificationModel.insertMany(notifications.slice(i, i + 1000));
    }

    res.json({ status: 'ok', sent_count: notifications.length });
  })
);
`;

c += '\n' + broadcastRoute;
fs.writeFileSync('backend/src/routes/admin.js', c);
console.log('Added /admin/broadcast route!');
