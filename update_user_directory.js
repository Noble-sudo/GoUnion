const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

// Replace actions
const oldActionsRegex = /<div className="flex items-center justify-end gap-2">[\s\S]*?<\/div>\s*<\/td>/;
const newActions = `<div className="flex items-center justify-end gap-2">
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => handlePromote(user.id, 'admin')}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                              title="Promote to Admin"
                            >
                              <UserCog size={16} />
                            </button>
                          )}
                          {user.role === 'admin' && (
                            <button 
                              onClick={() => handlePromote(user.id, 'user')}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Revoke Admin"
                            >
                              <UserX size={16} />
                            </button>
                          )}
                        </div>
                      </td>`;

content = content.replace(oldActionsRegex, newActions);

// Add institution filter
const filterDivRegex = /<div className="flex flex-col md:flex-row gap-4">/;
const newFilterDiv = `const [institutionFilter, setInstitutionFilter] = useState('All');

  const groupedUsers = useMemo(() => {
      let filtered = users.filter(user => {
        const matchesSearch = 
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.university?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const isActive = user.isActive ?? true;
        const matchesStatus = statusFilter === 'All' 
            ? true 
            : statusFilter === 'Active' ? isActive : !isActive;
            
        // Exclude unassigned students (keep admins/moderators or verified users)
        const isAssigned = Boolean(user.institution_id) || user.role === 'admin' || user.role === 'moderator';

        const matchesInst = institutionFilter === 'All' || user.institution_id === institutionFilter;
  
        return matchesSearch && matchesRole && matchesStatus && isAssigned && matchesInst;
      });`;

content = content.replace(/const groupedUsers = useMemo\(\(\) => \{[\s\S]*?return matchesSearch && matchesRole && matchesStatus && isAssigned;\s*\}\);/, newFilterDiv);

const extraFilterDivRegex = /<select \n\s*value=\{roleFilter\}/;
const newExtraFilter = `<select 
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none flex-1 md:flex-none cursor-pointer max-w-xs"
          >
            <option value="All">All Campuses</option>
            {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
          <select 
            value={roleFilter}`;

content = content.replace(/<select\s*value=\{roleFilter\}/, newExtraFilter);

// Add state for institutionFilter
content = content.replace(/const \[statusFilter, setStatusFilter\] = useState\('All'\);/, `const [statusFilter, setStatusFilter] = useState('All');\n  const [institutionFilter, setInstitutionFilter] = useState('All');`);

// Update useMemo dependencies
content = content.replace(/\[users, searchQuery, roleFilter, statusFilter, institutions\]/, `[users, searchQuery, roleFilter, statusFilter, institutionFilter, institutions]`);

// Remove Mod from role filter
content = content.replace(/<option value="moderator">Moderator<\/option>\n/, '');

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', content);
console.log('Updated UserDirectory filters and actions');
