import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const regex = /<button onClick=\{\(\) => setIsSuggestionsOpen\(true\)\} className="h-10 w-10 rounded-xl text-white\/50 hover:text-white hover:bg-white\/5 flex items-center justify-center">\s*<MoreVertical size=\{20\} \/>\s*<\/button>/g;
const matches = [...c.matchAll(regex)];
console.log('Matches found:', matches.length);

if (matches.length === 1) {
    const newHeaderMenu = `<div className="relative">
                                    <button onClick={() => setIsChatMenuOpen(!isChatMenuOpen)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center">
                                        <MoreVertical size={20} />
                                    </button>
                                    <AnimatePresence>
                                        {isChatMenuOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute right-0 top-12 w-48 bg-[#111114] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                                            >
                                                <Link to={activeChat?.partner?.isGroup ? \`/groups/\${activeChat?.partner?.id}\` : \`/profile/\${activeChat?.partner?.username}\`} onClick={() => setIsChatMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors">
                                                    <User size={16} /> View {activeChat?.partner?.isGroup ? "Group Details" : "Profile"}
                                                </Link>
                                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors text-left" onClick={() => { setIsChatMenuOpen(false); toast("Notifications muted", "success"); }}>
                                                    <BellOff size={16} /> Mute Notifications
                                                </button>
                                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left" onClick={() => { setIsChatMenuOpen(false); toast(activeChat?.partner?.isGroup ? "Left group" : "User blocked", "success"); }}>
                                                    {activeChat?.partner?.isGroup ? <LogOut size={16} /> : <Ban size={16} />}
                                                    {activeChat?.partner?.isGroup ? "Leave Group" : "Block User"}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>`;
    const lastIdx = matches[0].index;
    c = c.substring(0, lastIdx) + newHeaderMenu + c.substring(lastIdx + matches[0][0].length);
    
    if (!c.includes('const [isChatMenuOpen')) {
        const stateTarget = 'const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);';
        c = c.replace(stateTarget, stateTarget + '\n    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);');
    }
    
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Restored chat header menu!");
} else {
    console.log("Found " + matches.length + " occurrences!");
}
