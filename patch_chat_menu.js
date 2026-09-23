import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'import { ArrowLeft, Camera, Check, CheckCheck, Image as ImageIcon, FileText, MessageSquarePlus, MoreVertical, Paperclip, Plus, Search, Send, UserPlus, X, Mic, Smile, Trash2, Reply, Share, Share2, Keyboard, Maximize2, Download, ExternalLink } from "lucide-react";',
    'import { ArrowLeft, Camera, Check, CheckCheck, Image as ImageIcon, FileText, MessageSquarePlus, MoreVertical, Paperclip, Plus, Search, Send, UserPlus, X, Mic, Smile, Trash2, Reply, Share, Share2, Keyboard, Maximize2, Download, ExternalLink, User, BellOff, LogOut, Ban } from "lucide-react";'
);

c = c.replace(
    'const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);',
    'const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);\n    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);'
);

const oldHeaderMenu = `<button onClick={() => setIsSuggestionsOpen(true)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center">
                                    <MoreVertical size={20} />
                                </button>`;

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

// Be careful to only replace the ONE inside the active chat header, not the sidebar one.
// Let's replace the last occurrence, since the sidebar one is first.
const occurrences = [...c.matchAll(new RegExp(oldHeaderMenu.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'))];

if (occurrences.length === 2) {
    const lastIdx = occurrences[1].index;
    c = c.substring(0, lastIdx) + newHeaderMenu + c.substring(lastIdx + oldHeaderMenu.length);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Patched chat header menu");
} else {
    console.log("Found " + occurrences.length + " occurrences. Expected 2.");
}
