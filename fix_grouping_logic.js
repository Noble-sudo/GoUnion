const fs = require('fs');
let c = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

const oldGrouping = `      filtered.forEach(user => {
        let groupName = 'Unassigned';
          if (user.institution_id) {
              const inst = institutions.find(i => i.id === user.institution_id);
              if (inst) {
                  groupName = inst.name;
              } else {
                  groupName = user.university || 'University Student';
              }
          } else {
              groupName = user.university || 'University Student';
              if (user.role === 'admin' || user.role === 'moderator' || user.email?.includes('ezeilodavid292')) {
            groupName = 'Platform Admin / Staff';
          } else if (!user.institution_id) {
            groupName = 'Unassigned / Pending Verification';
          }
          }
        
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(user);
      });`;

const newGrouping = `      filtered.forEach(user => {
        let groupName = 'Unassigned';
        
        if (user.role === 'admin' || user.role === 'moderator' || user.email?.includes('ezeilodavid292')) {
            groupName = 'Platform Admin / Staff';
        } else if (user.institution_id) {
            const inst = institutions.find(i => i.id === user.institution_id);
            if (inst) {
                groupName = inst.name;
            } else {
                groupName = user.university || 'University Student';
            }
        } else {
            groupName = 'Unassigned / Pending Verification';
        }
        
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(user);
      });`;

if (c.includes("let groupName = 'Unassigned';")) {
    // We'll just replace the specific block to be safe.
    // Instead of string exact match which might fail on spaces, I'll use regex or substring replacement
    let startIdx = c.indexOf("filtered.forEach(user => {");
    let endIdx = c.indexOf("// Sort groups alphabetically");
    
    if (startIdx !== -1 && endIdx !== -1) {
        c = c.substring(0, startIdx) + newGrouping + "\n\n      " + c.substring(endIdx);
        fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', c);
        console.log("Grouping logic perfected.");
    } else {
        console.log("Could not find block boundaries");
    }
}
