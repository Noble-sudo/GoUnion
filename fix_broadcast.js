const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/BroadcastCenter.jsx', 'utf8');

if (!content.includes('useQuery')) {
  content = content.replace(
    /import \{ useToast \} from '\.\.\/\.\.\/components\/ui\/Toast';/,
    `import { useToast } from '../../components/ui/Toast';\nimport { useQuery } from '@tanstack/react-query';`
  );
}

// Add the query for active campuses
const queryString = `    const { data: activeCampuses = [], isLoading } = useQuery({
        queryKey: ['admin_active_campuses'],
        queryFn: async () => {
            const [instRes, usersRes] = await Promise.all([
                api.institutions.getAll(),
                api.admin.getUsers()
            ]);
            const activeInstIds = new Set(usersRes.filter(u => u.institution_id).map(u => String(u.institution_id)));
            return instRes.filter(inst => activeInstIds.has(String(inst.id)));
        }
    });`;

if (!content.includes('admin_active_campuses')) {
  content = content.replace(
    /const \[isSending, setIsSending\] = useState\(false\);/,
    `const [isSending, setIsSending] = useState(false);\n\n${queryString}`
  );
}

// Replace the hardcoded select options
const oldSelect = `<select name="campus_select" className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50">
                            <option value="">-- Choose University --</option>
                            <option value="unn">University of Nigeria, Nsukka</option>
                            <option value="unilag">University of Lagos</option>
                            <option value="oau">Obafemi Awolowo University</option>
                        </select>`;

const newSelect = `<select name="campus_select" className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50">
                            <option value="">-- Choose University --</option>
                            {isLoading ? (
                                <option value="" disabled>Loading active campuses...</option>
                            ) : activeCampuses.length === 0 ? (
                                <option value="" disabled>No campuses have verified users yet.</option>
                            ) : (
                                activeCampuses.map(campus => (
                                    <option key={campus.id} value={campus.id}>{campus.name}</option>
                                ))
                            )}
                        </select>`;

content = content.replace(oldSelect, newSelect);

fs.writeFileSync('frontend/components/admin/BroadcastCenter.jsx', content);
console.log('Fixed BroadcastCenter select');
