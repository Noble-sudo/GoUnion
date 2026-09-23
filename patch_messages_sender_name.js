import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// We want to insert the sender name above the message content if it's a group chat.
// Look for:
// <div className={`relative px-4 py-2 ${mine ? "bg-primary text-black rounded-tr-sm shadow-[0_4px_14px_rgba(196,255,14,0.15)]" : "bg-[#18181b] border border-white/10 text-white rounded-tl-sm shadow-[0_4px_14px_rgba(0,0,0,0.5)]"} rounded-2xl max-w-full`} onContextMenu={(e) => handleContextMenu(e, msg)}>

const regex = /<div className=\{`relative px-4 py-2 \$\{mine \? "bg-primary text-black rounded-tr-sm shadow-\[0_4px_14px_rgba\(196,255,14,0\.15\)\]" : "bg-\[#18181b\] border border-white\/10 text-white rounded-tl-sm shadow-\[0_4px_14px_rgba\(0,0,0,0\.5\)\]"\} rounded-2xl max-w-full`\} onContextMenu=\{\(e\) => handleContextMenu\(e, msg\)\}>/g;

const replacement = `<div className={\`relative px-4 py-2 \${mine ? "bg-primary text-black rounded-tr-sm shadow-[0_4px_14px_rgba(196,255,14,0.15)]" : "bg-[#18181b] border border-white/10 text-white rounded-tl-sm shadow-[0_4px_14px_rgba(0,0,0,0.5)]"} rounded-2xl max-w-full\`} onContextMenu={(e) => handleContextMenu(e, msg)}>
                                                                      {!mine && activeChat?.partner?.isGroup && (
                                                                          <div className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-1">
                                                                              {msg.sender?.fullName || msg.sender?.username || "Member"}
                                                                          </div>
                                                                      )}`;

content = content.replace(regex, replacement);

// Also fix the AudioPlayer senderAvatar and senderName for groups
content = content.replace(/senderAvatar=\{mine \? currentUser\?\.avatarUrl : activeChat\?\.partner\?\.avatarUrl\}/g, `senderAvatar={mine ? currentUser?.avatarUrl : (activeChat?.partner?.isGroup ? msg.sender?.avatarUrl : activeChat?.partner?.avatarUrl)}`);
content = content.replace(/senderName=\{mine \? currentUser\?\.fullName : activeChat\?\.partner\?\.fullName\}/g, `senderName={mine ? currentUser?.fullName : (activeChat?.partner?.isGroup ? msg.sender?.fullName : activeChat?.partner?.fullName)}`);

fs.writeFileSync('frontend/pages/Messages.jsx', content);
console.log("Patched Messages.jsx for group sender names!");
