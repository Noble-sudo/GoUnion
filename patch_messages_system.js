import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Also fix the system message banner!
// "if a new user joins, it should just be a small banner not that it will look like a message"
// Look for:
//                                                          <motion.div 
//                                                              initial={{ opacity: 0, y: 8 }} 
//                                                              animate={{ opacity: 1, y: 0 }} 
//                                                              drag="x"

const systemMsgRegex = /                                                          <motion\.div \r?\n                                                              initial=\{\{ opacity: 0, y: 8 \}\} \r?\n                                                              animate=\{\{ opacity: 1, y: 0 \}\} \r?\n                                                              drag="x"/;

const systemMsgReplacement = `                                                          {msg.senderId === 'system' ? (
                                                              <div className="flex justify-center my-4 w-full">
                                                                  <span className="bg-white/10 text-white/60 text-[11px] px-4 py-1.5 rounded-full font-medium tracking-wide">
                                                                      {msg.content}
                                                                  </span>
                                                              </div>
                                                          ) : (
                                                          <motion.div 
                                                              initial={{ opacity: 0, y: 8 }} 
                                                              animate={{ opacity: 1, y: 0 }} 
                                                              drag="x"`;

content = content.replace(systemMsgRegex, systemMsgReplacement);

// Close the wrapper for system message!
// We need to add the closing brace `)}` after the `</motion.div>` for that block!
// Wait, doing this with regex is tricky for the whole block. Let me write a custom patcher.
// The easiest way is to add `if (msg.senderId === 'system') return (...)` at the top of the map block, but it's inside a `React.Fragment`.

const fragmentRegex = /                                                      <React\.Fragment key=\{msg\.id\}>\r?\n                                                          \{showDate && \(/;

const fragmentReplacement = `                                                      <React.Fragment key={msg.id}>
                                                          {msg.senderId === 'system' ? (
                                                              <div className="flex justify-center my-4 w-full">
                                                                  <span className="bg-white/10 text-white/60 text-[11px] px-4 py-1.5 rounded-full font-medium tracking-wide">
                                                                      {msg.content}
                                                                  </span>
                                                              </div>
                                                          ) : (
                                                              <>
                                                          {showDate && (`;

content = content.replace(fragmentRegex, fragmentReplacement);

// And close the fragment
const fragmentEndRegex = /                                                                      \{mine && !msg\.isDeleted && \(\r?\n                                                                          msg\.isRead \? <CheckCheck size=\{14\} className="text-\[#3b82f6\] ml-1" \/> : activeChat\?\.partner\?\.isOnline \? <CheckCheck size=\{14\} className="text-white\/40 ml-1" \/> : <Check size=\{14\} className="text-white\/40 ml-1" \/>\r?\n                                                                      \)\}\r?\n                                                                  <\/div>\r?\n                                                              <\/div>\r?\n                                                          <\/motion\.div>\r?\n                                                      <\/React\.Fragment>/;

const fragmentEndReplacement = `                                                                      {mine && !msg.isDeleted && (
                                                                          msg.isRead ? <CheckCheck size={14} className="text-[#3b82f6] ml-1" /> : activeChat?.partner?.isOnline ? <CheckCheck size={14} className="text-white/40 ml-1" /> : <Check size={14} className="text-white/40 ml-1" />
                                                                      )}
                                                                  </div>
                                                              </div>
                                                          </motion.div>
                                                          </>)}
                                                      </React.Fragment>`;

content = content.replace(fragmentEndRegex, fragmentEndReplacement);

// Now for the online count in the header:
const headerRegex = /                                      <p className="text-xs truncate transition-colors">\r?\n                                          \{activeChat\.partner\.isOnline \? \(/;

const headerReplacement = `                                      <p className="text-xs truncate transition-colors">
                                          {activeChat.partner.isGroup ? (
                                              <span className="text-primary font-medium">{activeChat.partner.onlineCount || 0} online</span>
                                          ) : activeChat.partner.isOnline ? (`;

content = content.replace(headerRegex, headerReplacement);

fs.writeFileSync('frontend/pages/Messages.jsx', content);
console.log("Patched Messages.jsx for system messages and online count!");
