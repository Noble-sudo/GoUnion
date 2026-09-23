const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

// Restore Suspend User button
const actionHtml = `{user.role === 'admin' && (
                            <button 
                              onClick={() => handlePromote(user.id, 'user')}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Revoke Admin"
                            >
                              <UserX size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleToggleStatus(user.id, user.isActive ?? true)}
                            className={\`p-1.5 rounded-lg \${user.isActive ?? true ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-red-500/10 hover:bg-green-500/20 text-red-400 hover:text-green-400'} transition-colors\`}
                            title={user.isActive ?? true ? "Suspend User" : "Reactivate User"}
                          >
                            <Ban size={16} />
                          </button>`;
content = content.replace(/\{user\.role === 'admin' && \([\s\S]*?<\/button>\s*\)\}/, actionHtml);

// Fix grouping for Admins
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
          }`;
const newGrouping = `      filtered.forEach(user => {
        let groupName = 'Unassigned';
          if (user.role === 'admin' || user.role === 'moderator') {
              groupName = 'Platform Administration';
          } else if (user.institution_id) {
              const inst = institutions.find(i => i.id === user.institution_id);
              if (inst) {
                  groupName = inst.name;
              } else {
                  groupName = user.university || 'University Student';
              }
          } else {
              groupName = user.university || 'University Student';
          }`;
content = content.replace(oldGrouping, newGrouping);

// Active institutions filter
const newActiveInst = `const activeInstitutions = useMemo(() => {
        const instIds = new Set(users.filter(u => u.institution_id).map(u => u.institution_id));
        return institutions.filter(inst => instIds.has(inst.id));
    }, [users, institutions]);`;
content = content.replace(/const \[statusFilter, setStatusFilter\] = useState\('All'\);\n\s*const \[institutionFilter, setInstitutionFilter\] = useState\('All'\);/, `const [statusFilter, setStatusFilter] = useState('All');\n  const [institutionFilter, setInstitutionFilter] = useState('All');\n\n  ${newActiveInst}`);

content = content.replace(/\{institutions\.map\(inst => \(/, `{activeInstitutions.map(inst => (`);

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', content);
console.log('Fixed UserDirectory');
