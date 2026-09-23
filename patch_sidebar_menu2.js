const fs = require('fs');

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(/<button onClick=\{\(\) => setIsSuggestionsOpen\(true\)\} className="h-10 w-10 rounded-xl text-white\/50 hover:text-white hover:bg-white\/5 flex items-center justify-center group" title="New Chat">\s*<MessageSquarePlus size=\{20\} className="group-hover:scale-110 transition-transform" \/>\s*<\/button>/g, 
`<div className="flex items-center gap-1">
    <button onClick={() => setIsSuggestionsOpen(true)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center group" title="New Chat">
        <MessageSquarePlus size={20} className="group-hover:scale-110 transition-transform" />
    </button>
    <div className="relative">
        <button onClick={() => setChatListMenuOpen(!chatListMenuOpen)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center group" title="Menu">
            <MoreVertical size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <AnimatePresence>
            {chatListMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-48 bg-[#111114] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] flex flex-col"
                >
                    <Link to="/groups" className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors text-left">
                        <Users size={16} /> Browse Groups
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors text-left border-t border-white/5">
                        <SettingsIcon size={16} /> Settings
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
</div>`);

// Import Users and SettingsIcon
if (!c.includes('SettingsIcon')) {
    c = c.replace(/import \{ ArrowLeft/, 'import { ArrowLeft, Users, Settings as SettingsIcon');
}

// Ensure chatListMenuOpen state exists
if (!c.includes('setChatListMenuOpen')) {
    c = c.replace(/const \[isSuggestionsOpen, setIsSuggestionsOpen\] = useState\(false\);/, 'const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);\n    const [chatListMenuOpen, setChatListMenuOpen] = useState(false);');
}

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched sidebar correctly');
