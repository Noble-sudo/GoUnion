const fs = require('fs');

let content = fs.readFileSync('backend/src/store.js', 'utf8');

// Update publicUser to fallback to any identity if active_identity_id is null
content = content.replace(
  /let activeIdentity = null;\n\s*if \(plain\.active_identity_id\) \{\n\s*activeIdentity = await StudentIdentity\.findOne\(\{ id: plain\.active_identity_id \}\)\.lean\(\);\n\s*\}/,
  `let activeIdentity = null;
    if (plain.active_identity_id) {
      activeIdentity = await StudentIdentity.findOne({ id: plain.active_identity_id }).lean();
    } else {
      // Fallback: If they have a pending identity but no active_identity_id, load the most recent one
      activeIdentity = await StudentIdentity.findOne({ user_id: plain.id }).sort({ created_at: -1 }).lean();
      if (activeIdentity) {
        // Auto-fix the user document in the background
        User.updateOne({ id: plain.id }, { $set: { active_identity_id: activeIdentity.id } }).exec();
      }
    }`
);

fs.writeFileSync('backend/src/store.js', content);
console.log('store.js patched');
