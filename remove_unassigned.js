const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

const oldFilterLogic = `      let filtered = users.filter(user => {
        const matchesSearch = 
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.university?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const isActive = user.isActive ?? true;
        const matchesStatus = statusFilter === 'All' 
        return matchesSearch && matchesRole && matchesStatus;
      });`;

const newFilterLogic = `      let filtered = users.filter(user => {
        const matchesSearch = 
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.university?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const isActive = user.isActive ?? true;
        const matchesStatus = statusFilter === 'All';
        
        // Exclude unassigned students (keep admins/moderators or verified users)
        const isAssigned = Boolean(user.institution_id) || user.role === 'admin' || user.role === 'moderator';
        
        return matchesSearch && matchesRole && matchesStatus && isAssigned;
      });`;

content = content.replace(oldFilterLogic, newFilterLogic);

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', content);
console.log('Filtered out unassigned users');
