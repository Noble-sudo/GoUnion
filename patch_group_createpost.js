import fs from 'fs';

let content = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

const fakePostDiv = `{/* We inject the group ID so the CreatePost can post directly here if needed, 
                      though currently CreatePost in api.js handles it if we pass it, but standard GoUnion handles it via feed. 
                      Let's just show a simplified text box or standard CreatePost. */}
                   <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                     <div className="flex gap-4 items-center">
                       <img src={user?.avatarUrl} className="w-10 h-10 rounded-full border border-white/10" />
                       <div className="flex-1 bg-white/5 rounded-full py-3 px-5 text-white/40 text-sm cursor-text border border-white/5 transition-colors hover:bg-white/10">
                         Share something with the community...
                       </div>
                     </div>
                   </div>`;

content = content.replace(fakePostDiv, '<CreatePost groupId={group.id} />');

fs.writeFileSync('frontend/pages/GroupDetails.jsx', content);
console.log('Fixed CreatePost in GroupDetails');
