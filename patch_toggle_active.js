import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/admin.js', 'utf8');

const updatedToggleActive = `
adminRouter.post(
  '/users/:id/toggle-active',
  asyncHandler(async (req, res) => {
    const user = (await import('../models.js')).User;
    const target = await user.findOne({ id: req.params.id });
    if (!target) throw notFound('User not found.');
    
    const SUPER_ADMIN = 'ezeilodavid292@gmail.com';
    if (target.email === SUPER_ADMIN) { throw forbidden('The Super Admin cannot be suspended.'); }
    if (target.role === 'admin' && req.user.email !== SUPER_ADMIN) {
      throw forbidden('Only the Super Admin can suspend other admins.');
    }
    
    target.is_active = !target.is_active;
    if (!target.is_active) {
        target.suspension_reason = req.body.reason || 'Violation of community guidelines.';
    } else {
        target.suspension_reason = null;
        target.appeal_status = 'none';
        target.appeal_text = null;
    }
    
    await target.save();
    res.json({ status: 'ok', is_active: target.is_active });
  }),
);
`;

c = c.replace(/adminRouter\.post\(\s*'\/users\/:id\/toggle-active'[\s\S]*?res\.json\(await publicUser\(user, req\.user\.id\)\);\s*\}\),\s*\);/, updatedToggleActive);

fs.writeFileSync('backend/src/routes/admin.js', c);
console.log('Updated toggle-active to support reason');
