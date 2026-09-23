const fs = require('fs');
const path = 'backend/src/routes/groups.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const injectCode = `
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
`;

const targetLineIndex = lines.findIndex(l => l.includes('res.status(201).json({ id: event.id });'));

if (targetLineIndex !== -1) {
    lines.splice(targetLineIndex, 0, injectCode);
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully injected event notification logic!');
} else {
    console.log('Could not find target line');
}
