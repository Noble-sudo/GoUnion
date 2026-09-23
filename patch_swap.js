import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// 1. Restore the Chat Header (which currently has the Dropdown)
const chatHeaderRegex = /<div className="relative">\s*<button onClick=\{\(\) => setIsChatListMenuOpen\(!isChatListMenuOpen\)\} className="h-10 w-10 rounded-xl text-white\/50 hover:text-white hover:bg-white\/5 flex items-center justify-center">\s*<MoreVertical size=\{20\} \/>\s*<\/button>\s*\{isChatListMenuOpen && \([\s\S]*?<\/div>\s*<\/div>/;

const chatHeaderRestore = `<button onClick={() => setIsSuggestionsOpen(true)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center">
                                    <MoreVertical size={20} />
                                </button>`;

if (c.match(chatHeaderRegex)) {
    c = c.replace(chatHeaderRegex, chatHeaderRestore);
    console.log("Restored Chat Header!");
} else {
    console.log("Could not find dropdown in chat header.");
}

// 2. Replace the Sidebar Header (which currently has MessageSquarePlus)
const sidebarHeaderRegex = /<button onClick=\{\(\) => setIsSuggestionsOpen\(true\)\} className="h-10 w-10 rounded-xl text-white\/50 hover:text-white hover:bg-white\/5 flex items-center justify-center group" title="New Chat">\s*<MessageSquarePlus size=\{20\} className="group-hover:scale-110 transition-transform" \/>\s*<\/button>/;

const sidebarHeaderDropdown = `<div className="relative">
                            <button onClick={() => setIsChatListMenuOpen(!isChatListMenuOpen)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center">
                                <MoreVertical size={20} />
                            </button>
                            {isChatListMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsChatListMenuOpen(false)} />
                                    <div className="absolute top-12 right-0 z-50 bg-[#111114] border border-white/10 rounded-xl shadow-2xl p-1 w-48 flex flex-col">
                                        <button onClick={() => { setIsSuggestionsOpen(true); setIsChatListMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/10 rounded-lg w-full text-left transition-colors">
                                            <MessageSquarePlus size={15} className="text-white/50" /> New Chat
                                        </button>
                                        <button onClick={() => { setIsChatListMenuOpen(false); toast("All chats marked as read", "success"); }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/10 rounded-lg w-full text-left transition-colors">
                                            <CheckCheck size={15} className="text-white/50" /> Mark all as read
                                        </button>
                                        <button onClick={() => { setIsChatListMenuOpen(false); setNotificationsMuted(!notificationsMuted); toast(notificationsMuted ? "Notifications unmuted" : "Notifications muted", "success"); }} className={\`flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg w-full text-left transition-colors \${notificationsMuted ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}\`}>
                                            {notificationsMuted ? <Bell size={15} /> : <BellOff size={15} />} {notificationsMuted ? "Unmute Notifications" : "Mute Notifications"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>`;

if (c.match(sidebarHeaderRegex)) {
    c = c.replace(sidebarHeaderRegex, sidebarHeaderDropdown);
    console.log("Replaced Sidebar Header!");
} else {
    console.log("Could not find MessageSquarePlus in sidebar header.");
}

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Done");
