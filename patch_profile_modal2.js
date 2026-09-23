import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

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
`;

if (!content.includes('showDisconnectConfirm && (')) {
  // Use a regex to match the EditProfileModal part safely
  content = content.replace(
    /\{isEditModalOpen && <EditProfileModal [\s\S]*? \/>\}/,
    modalCode
  );
  fs.writeFileSync('frontend/pages/Profile.jsx', content);
  console.log('Appended disconnect modal successfully');
} else {
  console.log('Modal already exists');
}
