import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// 1. Add state for Info Modal
const stateRegex = /const \[msgToForward, setMsgToForward\] = useState\(null\);/;
const stateReplacement = `const [msgToForward, setMsgToForward] = useState(null);
    const [msgInfoModal, setMsgInfoModal] = useState(null);`;

content = content.replace(stateRegex, stateReplacement);

// 2. Add "Message Info" to context menu
// Find: <button onClick={() => { setMsgToForward(msg); setActiveMessageMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 transition-colors text-white/90">
//                                                                                              <Share size={14} /> Forward
//                                                                                          </button>
const menuRegex = /<button onClick=\{\(\) => \{ setMsgToForward\(msg\); setActiveMessageMenu\(null\); \}\} className="w-full text-left px-3 py-2 hover:bg-white\/5 flex items-center gap-2 transition-colors text-white\/90">\r?\n                                                                                              <Share size=\{14\} \/> Forward\r?\n                                                                                          <\/button>/;
const menuReplacement = `<button onClick={() => { setMsgToForward(msg); setActiveMessageMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 transition-colors text-white/90">
                                                                                              <Share size={14} /> Forward
                                                                                          </button>
                                                                                          {mine && (
                                                                                              <button onClick={() => { setMsgInfoModal(msg); setActiveMessageMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 transition-colors text-white/90">
                                                                                                  <FileText size={14} /> Message Info
                                                                                              </button>
                                                                                          )}`;

content = content.replace(menuRegex, menuReplacement);

// 3. Add Message Info Modal JSX at the end of the file, before final AnimatePresence block or before last closing div
const modalInjectRegex = /        <\/div>\r?\n    \);\r?\n\};\r?\n/;
const modalInjectReplacement = `            <AnimatePresence>
                {msgInfoModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={() => setMsgInfoModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0c] overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-white/5 p-4">
                                <h3 className="text-lg font-bold text-white">Message Info</h3>
                                <button onClick={() => setMsgInfoModal(null)} className="rounded-full p-2 hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-4 max-h-[60vh] overflow-y-auto">
                                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-white/80">{msgInfoModal.content || "Media Message"}</p>
                                    <p className="text-[10px] text-white/40 mt-2 uppercase tracking-wider">Sent {msgInfoModal.timestamp}</p>
                                </div>
                                
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                                    <CheckCheck size={14} className="text-[#3b82f6]" /> Read By
                                </h4>
                                
                                <div className="space-y-1">
                                    {!msgInfoModal.seenByUsers?.length ? (
                                        <p className="text-center text-sm text-white/40 py-6">No one has read this yet.</p>
                                    ) : (
                                        msgInfoModal.seenByUsers.map((s, i) => (
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
};
`;

content = content.replace(modalInjectRegex, modalInjectReplacement);

fs.writeFileSync('frontend/pages/Messages.jsx', content);
console.log("Patched Message Info modal!");
