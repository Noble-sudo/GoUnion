const fs = require('fs');
let content = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');

// The block I injected:
const injectedMobileNavRegex = /\{\/\* Mobile Navigation \*\/\}\s*<div className="md:hidden sticky top-0 z-50 bg-\[#0a0a0c\] border-b border-white\/5 p-4 flex items-center justify-between">[\s\S]*?<\/div>\s*<\/div>/;

// Wait, let's just use string replace using the exact code I injected earlier:
const blockToRemove = `{/* Mobile Navigation */}
            <div className="md:hidden sticky top-0 z-50 bg-[#0a0a0c] border-b border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-primary" />
                    <span className="font-bold text-xs tracking-widest uppercase">Admin</span>
                </div>
                <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-1 max-w-[70%]">
                    {navigation.map(nav => (
                        <button
                            key={nav.id}
                            onClick={() => setActiveTab(nav.id)}
                            className={\`whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${
                                activeTab === nav.id 
                                    ? 'bg-primary text-black' 
                                    : 'text-white/60 bg-white/5'
                            }\`}
                        >
                            <nav.icon size={14} />
                            {nav.label}
                        </button>
                    ))}
                </div>
            </div>`;

if (content.includes(blockToRemove)) {
    content = content.replace(blockToRemove, '');
    fs.writeFileSync('frontend/pages/AdminPanel.jsx', content);
    console.log('Removed injected mobile nav');
} else {
    console.log('Could not find injected block');
}
