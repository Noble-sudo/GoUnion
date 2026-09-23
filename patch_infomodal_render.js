const fs = require('fs');

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const modalStr = `
            {/* Message Info Modal */}
            <AnimatePresence>
                {infoMessage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInfoMessage(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0a0a0c] p-5 shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white tracking-tight">Message Info</h3>
                                <button onClick={() => setInfoMessage(null)} className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-5">
                                <p className="text-sm text-white/80 line-clamp-3">{infoMessage.content || "Media message"}</p>
                                <p className="text-xs text-white/40 mt-2 font-medium">{infoMessage.fullTimestamp || infoMessage.timestamp}</p>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3">Read By</h4>
                                
                                {!infoMessage.seenByUsers || infoMessage.seenByUsers.length === 0 ? (
                                    <p className="text-sm text-white/40 text-center py-4">No one has read this yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {infoMessage.seenByUsers.map((seen, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={seen.user?.avatarUrl} alt={seen.user?.fullName} label={seen.user?.fullName} className="h-10 w-10 rounded-full border border-white/10 object-cover" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{seen.user?.fullName}</p>
                                                        <p className="text-xs text-white/40">@{seen.user?.username}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <CheckCheck size={16} className="text-[#3b82f6] ml-auto mb-1" />
                                                    <p className="text-[10px] text-white/40">{new Date(seen.seenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
`;

c = c.replace(/        <\/div>\s*< \/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\;\s*\}\;/g, '</div>\n    );\n};');
c = c.replace(/        <\/div>\s*\)\;\s*\}\;/g, modalStr);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Injected InfoModal');
