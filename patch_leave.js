const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/groups.js', 'utf8');

content = content.replace(
  "const group = await Group.findOne({ id: req.params.id });\n      if (!group) throw notFound('Group not found.');\n      assertSameInstitution(group, req.user, 'Circle');",
  "const group = await Group.findOne({ id: req.params.id });\n      if (!group) throw notFound('Group not found.');\n      // Allow leaving regardless of institution scope"
);

fs.writeFileSync('backend/src/routes/groups.js', content);
console.log("Patched groups.js");
