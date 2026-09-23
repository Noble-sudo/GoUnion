import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const regex = /<button onClick=\{\(\) => setIsSuggestionsOpen\(true\)\} className="h-10 w-10 rounded-xl text-white\/50 hover:text-white hover:bg-white\/5 flex items-center justify-center">\s*<MoreVertical size=\{20\} \/>\s*<\/button>/;
const match = c.match(regex);
console.log('Match found?', !!match);

if (match) {
    const newBtn = `<div className="relative">
                            <button onClick={() => setIsChatListMenuOpen(!isChatListMenuOpen)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center">
                                <MoreVertical size={20} />
                            </button>
                            {isChatListMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsChatListMenuOpen(false)} />
                                    <div className="absolute top-12 right-0 z-50 bg-[#111114] border border-white/10 rounded-xl shadow-2xl p-1 w-48 flex flex-col">
                                        <button onClick={() => { setIsSuggestionsOpen(true); setIsChatListMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/10 rounded-lg w-full text-left transition-colors">
                                            <MessageSquarePlus size={15} className="text-white/50" /> New Chat
                                        </button>
                                        <button onClick={() => { setIsChatListMenuOpen(false); toast("All chats marked as read", "success"); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/10 rounded-lg w-full text-left transition-colors">
                                            <CheckCheck size={15} className="text-white/50" /> Mark all as read
                                        </button>
                                        <button onClick={() => { setIsChatListMenuOpen(false); toast("Notifications muted", "success"); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-full text-left transition-colors">
                                            <BellOff size={15} /> Mute Notifications
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>`;
    c = c.replace(regex, newBtn);
    const stateTarget = 'const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);';
    if (c.includes(stateTarget)) {
        c = c.replace(stateTarget, stateTarget + '\n    const [isChatListMenuOpen, setIsChatListMenuOpen] = useState(false);');
    }
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log('Patched correctly');
}
