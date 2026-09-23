import fs from 'fs';

let content = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

// 1. Add "chat" to TABS
content = content.replace(
  'const TABS = ["posts", "people", "events", "requests"];',
  'const TABS = ["chat", "posts", "people", "events", "requests"];'
);

// 2. Add "chat" to activeTab default (wait, default can stay "posts" or "chat")
// Let's leave "posts" as default or make "chat" default
content = content.replace(
  'const [activeTab, setActiveTab] = useState("posts");',
  'const [activeTab, setActiveTab] = useState("chat");'
);

// 3. Add the Chat Tab Content
const chatTabContent = `{/* CHAT TAB */}
            {activeTab === "chat" && (
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Live Group Chat</h3>
                <p className="text-white/50 mb-8 max-w-md mx-auto">
                  Join the real-time conversation with {group.name} members. Share voice notes, images, stickers, and more.
                </p>
                <button 
                  onClick={async () => {
                    try {
                      const res = await api.groups.getChat(group.id);
                      if (res.conversation_id) {
                        navigate('/messages?chat=' + res.conversation_id);
                      }
                    } catch (e) {
                      toast("Failed to open chat", "error");
                    }
                  }}
                  className="bg-primary text-black font-black py-4 px-10 rounded-2xl hover:bg-primary/90 transition-transform active:scale-95"
                >
                  Open Chat Room
                </button>
              </div>
            )}

            {/* POSTS TAB */}`;

content = content.replace('{/* POSTS TAB */}', chatTabContent);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', content);
console.log('Added Chat Tab to GroupDetails.jsx');
