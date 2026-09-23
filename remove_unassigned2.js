const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

const regex = /const matchesStatus = statusFilter === 'All'[\s\S]*?\? true[\s\S]*?: statusFilter === 'Active' \? isActive : !isActive;[\s\S]*?return matchesSearch && matchesRole && matchesStatus;/;

const replacement = `const matchesStatus = statusFilter === 'All' 
          ? true 
          : statusFilter === 'Active' ? isActive : !isActive;
          
        // Exclude unassigned students (keep admins/moderators or verified users)
        const isAssigned = Boolean(user.institution_id) || user.role === 'admin' || user.role === 'moderator';

        return matchesSearch && matchesRole && matchesStatus && isAssigned;`;

content = content.replace(regex, replacement);

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', content);
console.log('Successfully filtered out unassigned users');
