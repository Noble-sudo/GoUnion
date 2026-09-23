const fs = require('fs');

let c = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

c = c.replace(/      res\.status\(201\)\.json\(\{ id: event\.id \}\);/g, `      // Notify all group members about the new event
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
console.log('Fixed event notifications correctly');
