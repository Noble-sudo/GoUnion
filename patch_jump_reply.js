import fs from 'fs';

let msgJsx = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// 1. Add id to motion.div
msgJsx = msgJsx.replace(
  '<motion.div \n                                                            initial={{ opacity: 0, y: 8 }}',
  '<motion.div \n                                                            id={`msg-${msg.id}`}\n                                                            initial={{ opacity: 0, y: 8 }}'
);

// 2. Add onClick to repliedMsg div
msgJsx = msgJsx.replace(
  '<div className={`mb-2 p-2 rounded-xl border-l-2 text-xs ${mine ? "bg-black/10 border-black text-black/70" : "bg-black/30 border-primary text-white/70"}`}>',
  '<div onClick={(e) => { e.stopPropagation(); document.getElementById(`msg-${repliedMsg.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); setHighlightedMsgId(repliedMsg.id); setTimeout(() => setHighlightedMsgId(null), 2000); }} className={`mb-2 p-2 rounded-xl border-l-2 text-xs cursor-pointer hover:opacity-80 transition-opacity ${mine ? "bg-black/10 border-black text-black/70" : "bg-black/30 border-primary text-white/70"}`}>'
);

fs.writeFileSync('frontend/pages/Messages.jsx', msgJsx);
