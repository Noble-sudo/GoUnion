import fs from 'fs';

let content = fs.readFileSync('frontend/components/groups/EditGroupModal.jsx', 'utf8');

// Add category state
content = content.replace(
  'const [privacy, setPrivacy] = useState(group?.privacy || "public");',
  'const [privacy, setPrivacy] = useState(group?.privacy || "public");\n  const [category, setCategory] = useState(group?.category || "Other");'
);

// Add category to submit
content = content.replace(
  'updateMutation.mutate({ name, description, privacy, file: coverFile });',
  'updateMutation.mutate({ name, description, privacy, category, file: coverFile });'
);

// Add category field to form
const categoryField = `
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-[var(--rc-go)]">
                <option value="Academic" className="bg-[#111113]">Academic</option>
                <option value="Sports" className="bg-[#111113]">Sports</option>
                <option value="Social" className="bg-[#111113]">Social</option>
                <option value="Gaming" className="bg-[#111113]">Gaming</option>
                <option value="Career" className="bg-[#111113]">Career</option>
                <option value="Other" className="bg-[#111113]">Other</option>
              </select>
            </div>
`;

content = content.replace(
  '<div>\n              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Privacy</label>',
  categoryField + '\n            <div>\n              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Privacy</label>'
);

fs.writeFileSync('frontend/components/groups/EditGroupModal.jsx', content);
console.log('Added category to EditGroupModal');
