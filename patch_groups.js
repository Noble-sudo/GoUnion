import fs from 'fs';

let code = fs.readFileSync('backend/src/routes/groups.js', 'utf8');
code = code.replace(
  "groupsRouter.get(\n  '/',",
  "groupsRouter.get(\n  '/global',\n  requireAuth,\n  asyncHandler(async (req, res) => {\n    const groups = await Group.find({ is_active: true, privacy: 'public' }).sort({ created_at: -1 }).limit(10);\n    res.json(await Promise.all(groups.map((group) => serializeGroup(group, req.user.id))));\n  }),\n);\n\ngroupsRouter.get(\n  '/',"
);

fs.writeFileSync('backend/src/routes/groups.js', code);
console.log('Patched groups.js');
