const fs = require('fs');

let content = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');

// Add mobile navigation below the main container start
content = content.replace(
  /<div className="flex h-screen bg-black">/,
  `<div className="flex flex-col md:flex-row h-screen bg-black">`
);

// We need to inject a mobile nav bar at the top or bottom of the screen.
// Right after the aside tag ends:
content = content.replace(
  /<\/aside>/,
  `</aside>
            {/* Mobile Navigation */}
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
            </div>`
);

// Ensure the main content area handles mobile padding/margins well
content = content.replace(
  /<main className="flex-1 overflow-y-auto">/,
  `<main className="flex-1 overflow-y-auto custom-scrollbar">`
);
content = content.replace(
  /<div className="p-8 max-w-7xl mx-auto">/,
  `<div className="p-4 sm:p-8 max-w-7xl mx-auto">`
);

fs.writeFileSync('frontend/pages/AdminPanel.jsx', content);
console.log('Mobile nav injected into AdminPanel');
