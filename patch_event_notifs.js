const fs = require('fs');

let c = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

c = c.replace(/        attendees: \[req\.user\.id\]\s*\}\);\s*res\.status\(201\)\.json\(\{ id: event\.id \}\);/g, `        attendees: [req.user.id]
      });

      // Notify all group members about the new event
      try {
        const members = await GroupMember.find({ group_id: req.params.id });
        const group = await Group.findOne({ id: req.params.id });
        await Promise.all(members.filter(m => String(m.user_id) !== String(req.user.id)).map(m => 
          addNotification({
            user_id: m.user_id,
            sender_id: req.user.id,
            type: 'group_event',
            group_id: req.params.id,
            message: \`created a new event: "\${event.title}"\`
          })
        ));
      } catch (err) {
        // ignore notification errors
      }

      res.status(201).json({ id: event.id });`);

c = c.replace(/    event\.attendees = attendees;\s*await event\.save\(\);\s*res\.json\(\{ success: true, attendees: event\.attendees \}\);/g, `    event.attendees = attendees;
    await event.save();

    // Notify the creator if someone RSVP'd going
    if (req.body.status === 'going' && String(event.creator_id) !== String(req.user.id)) {
      try {
        const goingCount = event.attendees.length;
        await addNotification({
          user_id: event.creator_id,
          sender_id: req.user.id,
          type: 'group_event_rsvp',
          group_id: event.group_id,
          message: \`RSVP'd going to "\${event.title}". \${goingCount} people are now attending!\`
        });
      } catch (err) {
        // ignore notification errors
      }
    }

    res.json({ success: true, attendees: event.attendees });`);

fs.writeFileSync('backend/src/routes/groups.js', c);
console.log('Added event notifications to groups.js');
