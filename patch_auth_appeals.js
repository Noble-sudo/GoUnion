import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/auth.js', 'utf8');

const replacement = "if (!user.is_active) { return res.status(403).json({ error: 'Your account has been suspended.', is_suspended: true, suspension_reason: user.suspension_reason || 'Violation of community guidelines.', appeal_status: user.appeal_status || 'none', user_id: user.id, email: user.email }); }";

c = c.replace(/if \(!user\.is_active\)[^{]+'Your account has been suspended\.'\);/, replacement);

const appealEndpoint = `
authRouter.post('/appeal', asyncHandler(async (req, res) => {
    const { email, password, appeal_text } = req.body;
    const User = (await import('../models.js')).User;
    const bcrypt = await import('bcrypt');
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
        return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    if (user.is_active) {
        return res.status(400).json({ error: 'User is not suspended.' });
    }
    if (user.appeal_status === 'pending') {
        return res.status(400).json({ error: 'You already have a pending appeal.' });
    }
    user.appeal_status = 'pending';
    user.appeal_text = appeal_text;
    await user.save();
    res.json({ message: 'Appeal submitted successfully.' });
}));
`;

c = c.replace(/authRouter\.post\(\s*'\/refresh',/, appealEndpoint + "\nauthRouter.post('/refresh',");

fs.writeFileSync('backend/src/routes/auth.js', c);
console.log('Updated auth.js for appeals');
