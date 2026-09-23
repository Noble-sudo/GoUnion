const fs = require('fs');

let c = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

const eventRoutes = `
groupsRouter.get(
  '/:id/events',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { GroupEvent } = await import('../models.js');
    const events = await GroupEvent.find({ group_id: req.params.id }).sort({ start_time: 1 });
    res.json(events.map(e => {
      const obj = e.toObject();
      return {
        id: obj.id,
        groupId: obj.group_id,
        creatorId: obj.creator_id,
        title: obj.title,
        description: obj.description,
        location: obj.location,
        startTime: obj.start_time,
        endTime: obj.end_time,
        coverImage: obj.cover_image,
        attendees: obj.attendees || [],
        isAttending: (obj.attendees || []).includes(req.user.id)
      };
    }));
  })
);

groupsRouter.post(
  '/:id/events',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { GroupEvent } = await import('../models.js');
    if (!(await canManage(req.params.id, req.user))) {
      throw forbidden('Only admins can create events.');
    }
    const event = await GroupEvent.create({
      group_id: req.params.id,
      creator_id: req.user.id,
      title: req.body.title,
      description: req.body.description || '',
      location: req.body.location || '',
      start_time: req.body.startTime,
      end_time: req.body.endTime || null,
      attendees: [req.user.id]
    });
    res.status(201).json({ id: event.id });
  })
);

groupsRouter.post(
  '/events/:eventId/rsvp',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { GroupEvent } = await import('../models.js');
    const event = await GroupEvent.findOne({ id: req.params.eventId });
    if (!event) throw notFound('Event not found');
    
    let attendees = event.attendees || [];
    if (req.body.status === 'going') {
      if (!attendees.includes(req.user.id)) attendees.push(req.user.id);
    } else {
      attendees = attendees.filter(id => String(id) !== String(req.user.id));
    }
    event.attendees = attendees;
    await event.save();
    res.json({ success: true, attendees: event.attendees });
  })
);
`;

if (!c.includes('/events/:eventId/rsvp')) {
  c = c.replace(/export const groupsRouter = Router\(\);/, `export const groupsRouter = Router();\n${eventRoutes}`);
  fs.writeFileSync('backend/src/routes/groups.js', c);
  console.log('Added event routes to groups.js');
}
