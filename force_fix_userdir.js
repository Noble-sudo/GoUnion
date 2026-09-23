const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

const regex = /let groupName = user\.university \|\| 'Unassigned';\s*if \(\!user\.university && \(user\.role === 'admin' \|\| user\.role === 'moderator'\)\) \{\s*groupName = 'Platform Admin \/ Staff \(Unassigned\)';\s*\}/;

const replacement = `let groupName = 'Unassigned';
        if (user.institution_id) {
            const inst = institutions.find(i => i.id === user.institution_id);
            if (inst) {
                groupName = inst.name;
            } else {
                groupName = user.university || 'University Student';
            }
        } else {
            groupName = user.university || 'University Student';
            if (user.role === 'admin' || user.role === 'moderator') {
                groupName = 'Platform Admin / Staff';
            }
        }`;

content = content.replace(regex, replacement);

if (content.includes('Platform Admin / Staff')) {
  console.log('Successfully replaced logic!');
} else {
  console.log('Failed to replace!');
}

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', content);
