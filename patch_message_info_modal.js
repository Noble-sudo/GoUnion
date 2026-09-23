const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Replace {navigator.share && ... Message Info ... } with {mine && ... }
c = c.replace(
    /\{navigator\.share && \(\n\s*<button onClick=\{\(\) => setInfoMessage\(msg\)\} className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white\/10 rounded-lg w-full text-left">\n\s*<Info size=\{14\} \/> Message info\n\s*<\/button>\n\s*\)\}/,
    `{mine && (
        <button onClick={() => setInfoMessage(msg)} className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg w-full text-left">
            <Info size={14} /> Message info
        </button>
    )}`
);

// Inject Message Info modal at the end of Messages.jsx
const injectRegex = /<\/div>\s*<\/div>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>\s*<\/div>\s*\);\s*\};/m;
const injectModal = `</AnimatePresence>
            
            <AnimatePresence>
                {infoMessage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={() => setInfoMessage(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0c] overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-white/5 p-4">
                                <h3 className="text-lg font-bold text-white">Message Info</h3>
                                <button onClick={() => setInfoMessage(null)} className="rounded-full p-2 hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-4 max-h-[60vh] overflow-y-auto">
                                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-white/80">{infoMessage.content || "Media Message"}</p>
                                    <p className="text-[10px] text-white/40 mt-2 uppercase tracking-wider">Sent {infoMessage.timestamp}</p>
                                </div>
                                
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                                    <CheckCheck size={14} className="text-[#3b82f6]" /> Read By
                                </h4>
                                
                                <div className="space-y-1">
                                    {!infoMessage.seenByUsers?.length ? (
                                        <p className="text-center text-sm text-white/40 py-6">No one has read this yet.</p>
                                    ) : (
                                        infoMessage.seenByUsers.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={s.user?.avatarUrl} alt={s.user?.fullName} label={s.user?.fullName} className="h-10 w-10 rounded-full" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{s.user?.fullName}</p>
                                                        <p className="text-[11px] text-white/40">@{s.user?.username}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/40">{new Date(s.seenAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};`;

c = c.replace(injectRegex, injectModal);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched context menu and info modal');
