import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

if (!content.includes('AnimatePresence')) {
  content = content.replace(
    'import { motion } from "framer-motion";',
    'import { motion, AnimatePresence } from "framer-motion";'
  );
}

if (!content.includes('const [showDisconnectConfirm, setShowDisconnectConfirm]')) {
  content = content.replace(
    'const [isHoveringConnection, setIsHoveringConnection] = useState(false);',
    'const [isHoveringConnection, setIsHoveringConnection] = useState(false);\n  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);'
  );
}

const oldButton = `<button 
                    onClick={() => toggleFollowMutation.mutate()} 
                    disabled={toggleFollowMutation.isPending} 
                    onMouseEnter={() => setIsHoveringConnection(true)}
                    onMouseLeave={() => setIsHoveringConnection(false)}
                    className={\`flex h-10 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-colors \${isFollowingProfile ? 'border border-white/10 bg-white/5 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-white text-black hover:bg-white/90'}\`}>
                    {isFollowingProfile ? (
                      isHoveringConnection ? <>Disconnect</> : <>Connected</>
                    ) : (
                      <><UserPlus size={16} /> Connect</>
                    )}
                  </button>`;

const newButton = `<button 
                    onClick={() => {
                      if (isFollowingProfile) {
                        setShowDisconnectConfirm(true);
                      } else {
                        toggleFollowMutation.mutate();
                      }
                    }}
                    disabled={toggleFollowMutation.isPending} 
                    onMouseEnter={() => setIsHoveringConnection(true)}
                    onMouseLeave={() => setIsHoveringConnection(false)}
                    className={\`flex h-10 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-colors \${isFollowingProfile ? 'border border-white/10 bg-white/5 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-white text-black hover:bg-white/90'}\`}>
                    {isFollowingProfile ? (
                      isHoveringConnection ? <>Disconnect</> : <>Connected</>
                    ) : (
                      <><UserPlus size={16} /> Connect</>
                    )}
                  </button>`;

content = content.replace(oldButton, newButton);

const modalCode = `
      {isEditModalOpen && <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onUpdate={(updated) => updateUser({ ...currentUser, ...updated })} />}
      
      <AnimatePresence>
        {showDisconnectConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm rounded-3xl bg-[#111113] border border-white/10 p-6 shadow-2xl">
              <h3 className="text-lg font-black text-white mb-2">Disconnect</h3>
              <p className="text-sm text-zinc-400 mb-6">Are you sure you want to disconnect from @{user?.username}? You won't see their posts in your following feed.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDisconnectConfirm(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={() => { setShowDisconnectConfirm(false); toggleFollowMutation.mutate(); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors">Disconnect</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
`;

content = content.replace(
  '{isEditModalOpen && <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onUpdate={(updated) => updateUser({ ...currentUser, ...updated })} />}\n      </div>\n    );\n  };',
  modalCode.trim()
);

fs.writeFileSync('frontend/pages/Profile.jsx', content);
console.log('Profile modal patched');
