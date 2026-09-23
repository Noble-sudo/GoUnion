const fs = require('fs');

let c = fs.readFileSync('backend/src/routes/posts.js', 'utf8');

c = c.replace(
    /    if \(group_id\) \{\s*try \{\s*const io = getIo\(\);\s*if \(io\) \{\s*io\.to\(\`group:\$\{group_id\}\`\)\.emit\('new_group_message', \{\s*groupId: group_id,\s*message: serializedPost\s*\}\);\s*\}\s*\} catch \(e\) \{\s*\/\/ ignore\s*\}\s*\}/,
    `    if (group_id) {
      try {
        const io = getIo();
        if (io) {
          io.to(\`group:\${group_id}\`).emit('new_group_message', {
            groupId: group_id,
            message: serializedPost
          });
        }
      } catch (e) {
        // ignore
      }

      // Notify all group members about the new post
      try {
        const group = await Group.findOne({ id: group_id });
        const members = await GroupMember.find({ group_id });
        const groupName = group?.name || 'a circle';
        await Promise.all(
          members
            .filter(m => String(m.user_id) !== String(req.user.id))
            .map(m => addNotification({
              user_id: m.user_id,
              sender_id: req.user.id,
              type: 'group_post',
              post_id: post.id,
              group_id: group_id,
              message: \`posted in \${groupName}\`,
            }))
        );
      } catch (e) {
        // ignore notification errors
      }
    }`
);

fs.writeFileSync('backend/src/routes/posts.js', c);
console.log('Patched posts.js for group_post notifications');
