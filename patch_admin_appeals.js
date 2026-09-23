const fs = require('fs');

let c = fs.readFileSync('backend/src/routes/admin.js', 'utf8');

const routesToAdd = `
adminRouter.get('/appeals', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { User } = await import('../models.js');
    const appeals = await User.find({ appeal_status: { $in: ['pending', 'resolved', 'rejected'] } }).sort({ updated_at: -1 });
    
    res.json(appeals.map(u => ({
        id: u.id,
        user: {
            username: u.username,
            full_name: u.profile?.full_name,
            email: u.email,
            profile_picture: u.profile?.avatar_url
        },
        created_at: u.updated_at || u.created_at,
        status: u.appeal_status,
        suspension_reason: u.suspension_reason,
        appeal_text: u.appeal_text
    })));
}));

adminRouter.post('/appeals/:id/resolve', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { User } = await import('../models.js');
    const { status } = req.body;
    const user = await User.findOne({ id: req.params.id });
    if (!user) throw new Error('User not found');
    
    if (status === 'resolved' || status === 'approved') {
        user.is_active = true;
        user.appeal_status = 'resolved';
    } else {
        user.appeal_status = 'rejected';
    }
    
    await user.save();
    res.json({ success: true });
}));
`;

c = c.replace(/export const adminRouter = Router\(\);/, 'export const adminRouter = Router();\n' + routesToAdd);

fs.writeFileSync('backend/src/routes/admin.js', c);
console.log('Patched admin.js with appeals endpoints');
