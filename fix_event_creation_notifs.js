const fs = require('fs');

let c = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

c = c.replace(/      const event = await GroupEvent\.create\(\{\s*group_id: req\.params\.id,\s*creator_id: req\.user\.id,\s*title: req\.body\.title,\s*description: req\.body\.description \|\| '',\s*location: req\.body\.location \|\| '',\s*start_time: req\.body\.startTime,\s*end_time: req\.body\.endTime \|\| null,\s*attendees: \[req\.user\.id\]\s*\}\);\s*res\.status\(201\)\.json\(\{ id: event\.id \}\);/g, `      const event = await GroupEvent.create({
        group_id: req.params.id,
        creator_id: req.user.id,
        title: req.body.title,
        description: req.body.description || '',
        location: req.body.location || '',
        start_time: req.body.startTime,
        end_time: req.body.endTime || null,
        attendees: [req.user.id]
      });

      // Notify all group members about the new event
      try {
        const members = await GroupMember.find({ group_id: req.params.id });
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
        console.error('Error sending event notifications', err);
      }

      res.status(201).json({ id: event.id });`);

fs.writeFileSync('backend/src/routes/groups.js', c);
console.log('Fixed event notifications in groups.js');
