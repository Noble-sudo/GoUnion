import fs from 'fs';

let code = fs.readFileSync('frontend/pages/Groups.jsx', 'utf8');

// Add category to state
code = code.replace(
  'privacy: "public",',
  'privacy: "public",\n    category: "Academic",'
);
code = code.replace(
  'privacy: "public", image: null',
  'privacy: "public", category: "Academic", image: null'
);
// In the modal, right below Privacy, add Category selector
const categoryJSX = `
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Category</label>
                  <select 
                    value={newGroup.category} 
                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })} 
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-white/20 focus:bg-white/10 appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111113]">{c}</option>)}
                  </select>
                </div>
`;

code = code.replace(
  '<div className="space-y-2">\n                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>',
  categoryJSX + '\n                <div className="space-y-2">\n                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>'
);

fs.writeFileSync('frontend/pages/Groups.jsx', code);
console.log('Patched Groups.jsx');
