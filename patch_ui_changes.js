import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Header Online Count
const headerRegex = /                                      <p className="text-xs truncate transition-colors">\r?\n                                          \{activeChat\.partner\.isOnline \? \(/;

const headerReplacement = `                                      <p className="text-xs truncate transition-colors">
                                          {activeChat.partner.isGroup ? (
                                              <span className="text-primary font-medium">{activeChat.partner.onlineCount || 0} online</span>
                                          ) : activeChat.partner.isOnline ? (`;

content = content.replace(headerRegex, headerReplacement);

// System messages
// We can wrap the inner rendering of the map callback.
// We look for: `const repliedMsg = msg.replyToId ? ...`
// And replace it with a block that checks `if (msg.senderId === 'system') return ...`

const systemRegex = /                                                  const showDate = index === 0 \|\| msg\.dateLabel !== messages\[index - 1\]\?\.dateLabel;\r?\n                                                  const repliedMsg = msg\.replyToId \? messages\.find\(m => String\(m\.id\) === String\(msg\.replyToId\)\) : null;/;

const systemReplacement = `                                                  const showDate = index === 0 || msg.dateLabel !== messages[index - 1]?.dateLabel;
                                                  const repliedMsg = msg.replyToId ? messages.find(m => String(m.id) === String(msg.replyToId)) : null;

                                                  if (msg.senderId === 'system') {
                                                      return (
                                                          <React.Fragment key={msg.id}>
                                                              {showDate && (
                                                                  <div className="sticky top-2 z-10 my-3 flex justify-center">
                                                                      <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/45 backdrop-blur">{msg.dateLabel}</span>
                                                                  </div>
                                                              )}
                                                              <div className="flex justify-center my-4 w-full">
                                                                  <span className="bg-white/10 text-white/60 text-[11px] px-4 py-1.5 rounded-full font-medium tracking-wide">
                                                                      {msg.content}
                                                                  </span>
                                                              </div>
                                                          </React.Fragment>
                                                      );
                                                  }`;

content = content.replace(systemRegex, systemReplacement);


// Sender Username
// Find:
//                                                                      {repliedMsg && (
//                                                                          <div className={`mb-2 p-2 rounded-xl border-l-2 text-xs ${mine ? "bg-black/10 border-black text-black/70" : "bg-black/30 border-primary text-white/70"}`}>

const senderRegex = /                                                                      \{repliedMsg && \(\r?\n                                                                          <div className=\{`mb-2 p-2 rounded-xl border-l-2 text-xs \$\{mine \? "bg-black\/10 border-black text-black\/70" : "bg-black\/30 border-primary text-white\/70"\}`\}>/;

const senderReplacement = `                                                                      {!mine && activeChat?.partner?.isGroup && (
                                                                          <div className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-1">
                                                                              @{msg.sender?.username || msg.sender?.fullName || "member"}
                                                                          </div>
                                                                      )}
                                                                      {repliedMsg && (
                                                                          <div className={\`mb-2 p-2 rounded-xl border-l-2 text-xs \${mine ? "bg-black/10 border-black text-black/70" : "bg-black/30 border-primary text-white/70"}\`}>`;

content = content.replace(senderRegex, senderReplacement);

fs.writeFileSync('frontend/pages/Messages.jsx', content);
console.log("Patched UI changes properly!");
