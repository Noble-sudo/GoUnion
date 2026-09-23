const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/users.js', 'utf8');

content = content.replace(
  /const allowed = \['bio', 'university', 'profile_picture', 'cover_photo', 'course', 'hometown', 'full_name'\];\n    for \(const key of allowed\) if \(req\.body\[key\] !== undefined\) req\.user\.profile\[key\] = req\.body\[key\];\n    if \(req\.body\.university !== undefined\) \{\n      req\.user\.profile\.university = req\.body\.university;\n    \}\);\n      if \(resolvedInstitution\) \{\n        req\.user\.institution_id = resolvedInstitution\.id;\n        req\.user\.profile\.university = resolvedInstitution\.name;\n      \}\n    \}/,
  `const allowed = ['bio', 'university', 'profile_picture', 'cover_photo', 'course', 'hometown', 'full_name'];
    for (const key of allowed) if (req.body[key] !== undefined) req.user.profile[key] = req.body[key];
    if (req.body.university !== undefined) {
      req.user.profile.university = req.body.university;
    }`
);

fs.writeFileSync('backend/src/routes/users.js', content);
console.log('Fixed users.js syntax error');
