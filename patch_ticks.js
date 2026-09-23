import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetTicks = `msg.isRead ? <CheckCheck size={14} className="text-[#3b82f6] ml-1" /> : activeChat?.partner?.isOnline ? <CheckCheck size={14} className="text-white/40 ml-1" /> : <Check size={14} className="text-white/40 ml-1" />`;

const replacementTicks = `(() => {
                                                                            if (!activeChat?.partner?.isGroup) {
                                                                                return msg.isRead ? <CheckCheck size={14} className="text-[#3b82f6] ml-1" /> : <CheckCheck size={14} className="text-white/40 ml-1" />;
                                                                            }
                                                                            const seenCount = msg.seenByUsers?.length || 0;
                                                                            const totalOthers = (activeChat?.participants?.length || 1) - 1;
                                                                            if (seenCount === 0) return <Check size={14} className="text-white/40 ml-1" />;
                                                                            if (seenCount > 0 && seenCount < totalOthers) return <CheckCheck size={14} className="text-white/40 ml-1" />;
                                                                            return <CheckCheck size={14} className="text-[#3b82f6] ml-1" />;
                                                                        })()`;

c = c.replace(targetTicks, replacementTicks);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched ticks logic");
