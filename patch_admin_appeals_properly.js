import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/admin.js', 'utf8');

const appealEndpoints = `
adminRouter.get(
  '/appeals',
  asyncHandler(async (req, res) => {
    const User = (await import('../models.js')).User;
    const appeals = await User.find({ appeal_status: 'pending' }).select('id email username profile suspension_reason appeal_text created_at is_active').lean();
    res.json(appeals.map(u => ({
        id: u.id,
        user: { id: u.id, username: u.username, email: u.email, fullName: u.profile?.full_name || u.username, avatarUrl: u.profile?.avatar || null },
        reason: u.suspension_reason,
        appeal_text: u.appeal_text,
        created_at: u.created_at
    })));
  }),
);

adminRouter.post(
  '/appeals/:id/resolve',
  asyncHandler(async (req, res) => {
    const { status } = req.body; // 'resolved' (un-suspend) or 'rejected' (keep suspended)
    const User = (await import('../models.js')).User;
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
       return res.status(404).json({error: 'Not found'});
    }
    
    if (status === 'resolved') {
        user.is_active = true;
        user.appeal_status = 'resolved';
        user.suspension_reason = null;
        user.appeal_text = null;
    } else if (status === 'rejected') {
        user.appeal_status = 'rejected';
    }
    
    await user.save();
    res.json({ status: 'ok', user_id: user.id });
  }),
);
`;

// append before export
c = c.replace(/export \{ adminRouter \};?/, appealEndpoints + '\nexport { adminRouter };');

fs.writeFileSync('backend/src/routes/admin.js', c);
console.log('Added admin appeal endpoints properly');
