import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/admin.js', 'utf8');

// 1. Ensure addNotification is imported
if (!c.includes('addNotification')) {
    c = c.replace('serializePost } from', 'serializePost, addNotification } from');
}

// 2. Fix stats to exclude taken down posts
c = c.replace(
    "Post.countDocuments({ group_id: null }),", 
    "Post.countDocuments({ group_id: null, is_taken_down: { $ne: true } }),"
);
c = c.replace(
    "Post.aggregate([{ $match: { group_id: null } }", 
    "Post.aggregate([{ $match: { group_id: null, is_taken_down: { $ne: true } } }"
);

// 3. Fix Role logic (Super Admin rules)
const roleRouteRegex = /adminRouter\.put\(\s*'\/users\/:id\/role'[\s\S]*?res\.json\(await publicUser\(user, req\.user\.id\)\);\s*\}\),\s*\);/;
const newRoleRoute = `adminRouter.put(
  '/users/:id/role',
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if (!user) throw notFound('User not found.');
    
    const SUPER_ADMIN = 'ezeilodavid292@gmail.com';
    const newRole = req.query.role || req.body.role || user.role;

    // Super Admin Protection
    if (user.email === SUPER_ADMIN && req.user.email !== SUPER_ADMIN) {
      throw forbidden('You cannot modify the Super Admin.');
    }

    // Only Super Admin can revoke or modify other admins
    if (user.role === 'admin' && req.user.email !== SUPER_ADMIN && user.email !== req.user.email) {
      throw forbidden('Only the Super Admin can revoke or modify other admins.');
    }

    // Only Super Admin can promote users to Admin
    if (newRole === 'admin' && req.user.email !== SUPER_ADMIN) {
      throw forbidden('Only the Super Admin can promote users to Admin.');
    }
    
    user.role = newRole;
    await user.save();
    res.json(await publicUser(user, req.user.id));
  }),
);`;
c = c.replace(roleRouteRegex, newRoleRoute);

// 4. Fix Toggle Active logic
const toggleRouteRegex = /adminRouter\.post\(\s*'\/users\/:id\/toggle-active'[\s\S]*?res\.json\(await publicUser\(user, req\.user\.id\)\);\s*\}\),\s*\);/;
const newToggleRoute = `adminRouter.post(
  '/users/:id/toggle-active',
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if (!user) throw notFound('User not found.');
    
    const SUPER_ADMIN = 'ezeilodavid292@gmail.com';
    
    if (user.email === SUPER_ADMIN && req.user.email !== SUPER_ADMIN) {
      throw forbidden('You cannot suspend the Super Admin.');
    }

    if (user.role === 'admin' && req.user.email !== SUPER_ADMIN) {
      throw forbidden('Only the Super Admin can suspend other admins.');
    }
    
    user.is_active = !user.is_active;
    await user.save();
    res.json(await publicUser(user, req.user.id));
  }),
);`;
c = c.replace(toggleRouteRegex, newToggleRoute);

// 5. Fix Takedown Notification logic
const resolveRouteRegex = /if \(post\) \{[\s\S]*?await post\.save\(\);\s*\}/;
const newResolveRoute = `if (post) {
            post.is_taken_down = true;
            post.take_down_reason = req.body.take_down_reason || 'Violation of community guidelines.';
            await post.save();
            
            // Notify the creator
            await addNotification(post.user_id, {
                type: 'post_takedown',
                message: \`Your post was taken down by an admin. Reason: \${post.take_down_reason}\`,
                sender_id: req.user.id
            });
        }`;
c = c.replace(resolveRouteRegex, newResolveRoute);

fs.writeFileSync('backend/src/routes/admin.js', c);
console.log('Patched backend admin logic successfully!');
