import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// 1. Header Online Count
// Let's find: <p className="text-xs truncate transition-colors">
const pIndex = content.indexOf('<p className="text-xs truncate transition-colors">');
if (pIndex !== -1) {
    const isOnlineIdx = content.indexOf('{activeChat.partner.isOnline ? (', pIndex);
    if (isOnlineIdx !== -1) {
        content = content.substring(0, isOnlineIdx) + `{activeChat.partner.isGroup ? (
                                              <span className="text-primary font-medium">{activeChat.partner.onlineCount || 0} online</span>
                                          ) : ` + content.substring(isOnlineIdx + 1);
        console.log("Patched online count!");
    } else console.log("Failed to find isOnline");
} else console.log("Failed to find header p");

// 2. System Messages
// Let's find: const repliedMsg = msg.replyToId ? messages.find(m => String(m.id) === String(msg.replyToId)) : null;
const repliedMsgIdx = content.indexOf('const repliedMsg = msg.replyToId ? messages.find(m => String(m.id) === String(msg.replyToId)) : null;');
if (repliedMsgIdx !== -1) {
    const injectStr = `

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
    content = content.substring(0, repliedMsgIdx + 101) + injectStr + content.substring(repliedMsgIdx + 101);
    console.log("Patched system messages!");
} else console.log("Failed to find repliedMsg const");


// 3. Sender Username
// Let's find: {repliedMsg && (
// Wait, there are multiple {repliedMsg && (. We need the one right after <div ... className=...mine ? "bg-primary...
const chatBubbleRegex = /className=\{`rounded-2xl px-3 py-2 shadow-md border cursor-pointer select-none transition-all duration-500[\s\S]*?>\r?\n\s*\{repliedMsg && \(/;
const match = chatBubbleRegex.exec(content);
if (match) {
    const matchedText = match[0];
    const replacement = matchedText.replace('{repliedMsg && (', `{!mine && activeChat?.partner?.isGroup && (
                                                                          <div className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-1">
                                                                              @{msg.sender?.username || msg.sender?.fullName || "member"}
                                                                          </div>
                                                                      )}
                                                                      {repliedMsg && (`);
    content = content.replace(matchedText, replacement);
    console.log("Patched sender username!");
} else console.log("Failed to find chat bubble regex");

fs.writeFileSync('frontend/pages/Messages.jsx', content);
