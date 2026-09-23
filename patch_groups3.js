import fs from 'fs';

let groupsCode = fs.readFileSync('frontend/pages/Groups.jsx', 'utf8');

// Fix isJoined
groupsCode = groupsCode.replace(
  /g\.is_joined/g,
  'g.isJoined'
);

// Fix Categories filtering (the user said selecting categories doesn't work).
// Oh! The user clicked the Category buttons in Discover, but they don't filter!
// Because the Category buttons just render `CATEGORIES.map` but don't set a filter state!
const filterStateCode = `
  const [selectedCategory, setSelectedCategory] = useState(null);
`;
groupsCode = groupsCode.replace(
  'const [activeTab, setActiveTab] = useState("my_circles");',
  'const [activeTab, setActiveTab] = useState("my_circles");\n  const [selectedCategory, setSelectedCategory] = useState(null);'
);

// Apply filter to discoverCircles
groupsCode = groupsCode.replace(
  'const discoverCircles = filteredGroups.filter(g => !g.isJoined);',
  'const discoverCircles = filteredGroups.filter(g => !g.isJoined && (!selectedCategory || g.category === selectedCategory || (selectedCategory === "Other" && !CATEGORIES.includes(g.category))));'
);

// Make Category buttons active
const oldCategoryButtons = `<button key={c} className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                      {c}
                    </button>`;
const newCategoryButtons = `<button key={c} onClick={() => setSelectedCategory(selectedCategory === c ? null : c)} className={\`whitespace-nowrap px-4 py-2 rounded-xl border text-xs font-bold transition-colors \${selectedCategory === c ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'}\`}>
                      {c}
                    </button>`;
groupsCode = groupsCode.replace(oldCategoryButtons, newCategoryButtons);

fs.writeFileSync('frontend/pages/Groups.jsx', groupsCode);
console.log('Patched Groups.jsx');
