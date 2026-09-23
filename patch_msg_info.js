import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    '<ExternalLink size={14} /> Share externally',
    '<Info size={14} /> Message info'
);

c = c.replace(
    '<ExternalLink size={12} /> <span className="hidden sm:inline">Share</span>',
    '<Info size={12} /> <span className="hidden sm:inline">Info</span>'
);

// We need to change onClick={() => handleShare(msg, mine)} to onClick={() => openMessageInfo(msg)}
c = c.replace(/onClick=\{.*?handleShare\(msg, mine\).*?\}/g, 'onClick={() => setInfoMessage(msg)}');
c = c.replace(/title="Share Externally"/g, 'title="Message Info"');

// We need to add state for infoMessage and the modal rendering
const stateImport = 'const [infoMessage, setInfoMessage] = useState(null);';
const stateRegex = /const \[isEmojiPickerOpen, setIsEmojiPickerOpen\] = useState\(false\);/;
if (c.match(stateRegex)) {
    c = c.replace(stateRegex, 'const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);\n    const [infoMessage, setInfoMessage] = useState(null);');
}

// Add Info import if needed
if (!c.includes('Info,')) {
    c = c.replace('ExternalLink,', 'ExternalLink, Info,');
}

// Add the MessageInfoModal rendering at the end of the return statement (inside AnimatePresence for modals)
const modalCode = `
                {infoMessage && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111114] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative shadow-2xl">
                            <button onClick={() => setInfoMessage(null)} className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
                            <h3 className="text-lg font-bold text-white mb-6">Message Info</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Sent</h4>
                                    <p className="text-sm text-white">{new Date(infoMessage.createdAt || infoMessage.timestamp).toLocaleString()}</p>
                                </div>
                                
                                <div>
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Read by</h4>
                                    {infoMessage.seenByUsers?.length > 0 ? (
                                        <div className="space-y-3">
                                            {infoMessage.seenByUsers.map(s => (
                                                <div key={s.user.id} className="flex items-center gap-3">
                                                    <img src={s.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-white truncate">{s.user.fullName}</p>
                                                        <p className="text-xs text-white/50">{new Date(s.seenAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white/50 italic">Not read by anyone yet</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
`;

const insertPoint = '{isImageModalOpen && (';
c = c.replace(insertPoint, modalCode + '\n                ' + insertPoint);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched Messages.jsx with Message Info modal!");
