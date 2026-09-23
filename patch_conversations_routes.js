import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

const newRoutes = `

conversationsRouter.post(
  '/:id/mute',
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetId = String(req.params.id);
    if (!req.user.muted_conversations.includes(targetId)) {
      req.user.muted_conversations.push(targetId);
      await req.user.save();
    }
    res.json({ status: 'muted' });
  }),
);

conversationsRouter.post(
  '/:id/unmute',
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetId = String(req.params.id);
    req.user.muted_conversations = req.user.muted_conversations.filter(id => id !== targetId);
    await req.user.save();
    res.json({ status: 'unmuted' });
  }),
);
`;

c += newRoutes;
fs.writeFileSync('backend/src/routes/conversations.js', c);
console.log("Appended mute and unmute routes!");
