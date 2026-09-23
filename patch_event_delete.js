const fs = require('fs');
let c = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

const deleteRoute = `
groupsRouter.delete(
  '/events/:eventId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { GroupEvent } = await import('../models.js');
    const event = await GroupEvent.findOne({ id: req.params.eventId });
    if (!event) throw notFound('Event not found');
    
    if (!(await canManage(event.group_id, req.user))) {
      throw forbidden('Only admins can delete events.');
    }
    
    await GroupEvent.deleteOne({ id: req.params.eventId });
    res.json({ success: true });
  })
);
`;

if (!c.includes('/events/:eventId\'')) {
  c = c.replace(/export const groupsRouter = Router\(\);/, `export const groupsRouter = Router();\n${deleteRoute}`);
  fs.writeFileSync('backend/src/routes/groups.js', c);
  console.log('Added DELETE event route');
}
