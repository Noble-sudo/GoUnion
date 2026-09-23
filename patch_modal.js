import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetModalStart = `{msgInfoModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={() => setMsgInfoModal(null)}>`;

const targetModalEnd = `</motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>`;

const newModal = `{msgInfoModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={() => setMsgInfoModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a0a0c] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-4">
                                <h3 className="text-lg font-black tracking-tight text-white">Message Info</h3>
                                <button onClick={() => setMsgInfoModal(null)} className="rounded-full p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-5 max-h-[70vh] overflow-y-auto">
                                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[15px] leading-relaxed text-white/90">{msgInfoModal.content || (msgInfoModal.imageUrl ? "Image" : msgInfoModal.videoUrl ? "Video" : msgInfoModal.audioUrl ? "Voice Note" : "Media")}</p>
                                    <p className="text-[11px] font-bold text-white/40 mt-3 uppercase tracking-wider">{msgInfoModal.fullTimestamp || msgInfoModal.timestamp}</p>
                                </div>
                                
                                {/* READ BY */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#3b82f6] mb-3 flex items-center gap-2">
                                        <CheckCheck size={16} /> Read By
                                    </h4>
                                    <div className="space-y-1">
                                        {!msgInfoModal.seenByUsers?.length ? (
                                            <p className="text-sm text-white/30 italic py-2">No one has read this yet.</p>
                                        ) : (
                                            msgInfoModal.seenByUsers.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar src={s.user?.avatarUrl} alt={s.user?.fullName} label={s.user?.fullName} className="h-10 w-10 rounded-full" />
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{s.user?.fullName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-xs font-medium text-white/70">{new Date(s.seenAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                        <p className="text-[10px] text-[#3b82f6]">Read</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* DELIVERED TO */}
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                        <CheckCheck size={16} /> Delivered To
                                    </h4>
                                    <div className="space-y-1">
                                        {(() => {
                                            const seenIds = new Set(msgInfoModal.seenByUsers?.map(s => String(s.user?.id)) || []);
                                            const deliveredUsers = activeChat?.participants?.filter(p => String(p.id) !== String(currentUserId) && !seenIds.has(String(p.id))) || [];
                                            
                                            if (!deliveredUsers.length) {
                                                return <p className="text-sm text-white/30 italic py-2">Delivered to everyone.</p>;
                                            }
                                            
                                            return deliveredUsers.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors opacity-70">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar src={p.avatarUrl} alt={p.fullName} label={p.fullName} className="h-10 w-10 rounded-full grayscale" />
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{p.fullName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-xs font-medium text-white/50">{msgInfoModal.timestamp}</p>
                                                        <p className="text-[10px] text-white/40">Delivered</p>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>`;

const parts = c.split(targetModalStart);
if (parts.length === 2) {
    const endParts = parts[1].split(targetModalEnd);
    c = parts[0] + newModal + endParts[1];
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Patched Message Info Modal");
} else {
    console.log("Could not find modal start");
}
