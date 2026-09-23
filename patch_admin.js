const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/admin.js', 'utf8');

const identitiesEndpoints = `
adminRouter.get('/identities', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { StudentIdentity, User, Institution } = await import('../models.js');
  const identities = await StudentIdentity.find({ status: 'PENDING' }).sort({ created_at: -1 }).lean();
  
  const userIds = identities.map(i => i.user_id);
  const instIds = identities.map(i => i.institution_id);
  
  const [users, institutions] = await Promise.all([
    User.find({ id: { $in: userIds } }).lean(),
    Institution.find({ id: { $in: instIds } }).lean()
  ]);
  
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const instMap = Object.fromEntries(institutions.map(i => [i.id, i.name]));
  
  res.json(identities.map(i => ({
    ...i,
    user: userMap[i.user_id] ? { id: userMap[i.user_id].id, username: userMap[i.user_id].username, email: userMap[i.user_id].email, full_name: userMap[i.user_id].profile?.full_name } : null,
    institution_name: instMap[i.institution_id] || 'Unknown'
  })));
}));

adminRouter.post('/identities/:id/:action', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { StudentIdentity, User } = await import('../models.js');
  const { id, action } = req.params;
  
  if (!['approve', 'reject'].includes(action)) {
    throw new (await import('../utils/httpError.js')).HttpError(400, 'Invalid action.');
  }
  
  const identity = await StudentIdentity.findOne({ id });
  if (!identity) throw new (await import('../utils/httpError.js')).HttpError(404, 'Identity not found.');
  
  if (action === 'approve') {
    identity.status = 'VERIFIED';
    identity.verified_at = new Date();
    await identity.save();
    
    // Also update the user's active campus if they don't have one
    const user = await User.findOne({ id: identity.user_id });
    if (user && !user.active_identity_id) {
      user.active_identity_id = identity.id;
      await user.save();
    }
  } else {
    identity.status = 'REJECTED';
    await identity.save();
  }
  
  res.json({ status: 'ok', identity });
}));
`;

content = content.replace(
  /export const adminRouter = Router\(\);/,
  `export const adminRouter = Router();\n${identitiesEndpoints}`
);

fs.writeFileSync('backend/src/routes/admin.js', content);
console.log('admin.js patched with identity endpoints.');
