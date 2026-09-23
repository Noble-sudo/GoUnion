const fs = require('fs');

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const oldHeader = `<div className="h-16 px-4 bg-[#0a0a0c]/95 border-b border-white/5 flex items-center justify-between">
                        <button onClick={() => navigate("/")} className="h-10 w-10 rounded-xl text-white/55 hover:text-white hover:bg-white/5 flex items-center justify-center shrink-0">
                            <ArrowLeft size={21} />
                        </button>
                        <Link to="/" className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-primary text-black flex items-center justify-center font-black shadow-lg shadow-primary/20">G</div>
                            <div className="min-w-0">
                                <p className="font-semibold leading-none text-white">GoUnion Chats</p>
                                <p className="text-xs text-white/40 mt-1">Direct Messages</p>
                            </div>
                        </Link>
                        <button onClick={() => setIsSuggestionsOpen(true)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center group" title="New Chat">
                            <MessageSquarePlus size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>`;

const newHeader = `<div className="h-16 px-4 bg-[#0a0a0c]/95 border-b border-white/5 flex items-center justify-between">
                        <button onClick={() => navigate("/")} className="h-10 w-10 rounded-xl text-white/55 hover:text-white hover:bg-white/5 flex items-center justify-center shrink-0">
                            <ArrowLeft size={21} />
                        </button>
                        <Link to="/" className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="h-10 w-10 rounded-xl bg-primary text-black flex items-center justify-center font-black shadow-lg shadow-primary/20 shrink-0">G</div>
                            <div className="min-w-0">
                                <p className="font-semibold leading-none text-white truncate">GoUnion Chats</p>
                                <p className="text-xs text-white/40 mt-1 truncate">Direct Messages</p>
                            </div>
                        </Link>
                        
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
                                        <button onClick={() => { setIsSuggestionsOpen(true); setChatListMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors text-left">
                                            <MessageSquarePlus size={16} /> Contacts & Suggestions
                                        </button>
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
                    </div>`;

c = c.replace(oldHeader, newHeader);
c = c.replace(/const \[isSuggestionsOpen, setIsSuggestionsOpen\] = useState\(false\);/, 'const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);\n    const [chatListMenuOpen, setChatListMenuOpen] = useState(false);');

// Import Users and SettingsIcon from lucide-react
c = c.replace(/import \{ ArrowLeft/, 'import { ArrowLeft, Users, Settings as SettingsIcon');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched sidebar menu');
