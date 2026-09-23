import fs from 'fs';

let content = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

// 1. Import necessary icons and things
content = content.replace(
  'import { ArrowLeft, Lock, Globe, Users, Edit, Share2, Calendar } from "lucide-react";',
  'import { ArrowLeft, Lock, Globe, Users, Edit, Share2, Calendar, Check, X } from "lucide-react";'
);

// 2. Add JoinRequestModal at the top
const joinRequestModalCode = `
const JoinRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a0a0c] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">Join Request</h2>
          <button onClick={onClose} className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-white/50 mb-4">Please introduce yourself and explain why you'd like to join this circle.</p>
        <textarea
          value={message} onChange={e => setMessage(e.target.value)}
          placeholder="I'm interested in..."
          className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[var(--rc-go)] mb-6"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={() => onSubmit(message)} className="px-5 py-2.5 rounded-xl bg-[var(--rc-go)] text-black text-sm font-bold hover:bg-[#b0eb38] transition-colors">Submit Request</button>
        </div>
      </motion.div>
    </div>
  );
};
`;

content = content.replace('export const GroupDetails = () => {', joinRequestModalCode + '\nexport const GroupDetails = () => {');

// 3. State for join modal and requests fetching
content = content.replace(
  'const [isEditModalOpen, setIsEditModalOpen] = useState(false);',
  'const [isEditModalOpen, setIsEditModalOpen] = useState(false);\n  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);'
);

const requestQueries = `
  const { data: requests = [] } = useQuery({
    queryKey: ["group-requests", id],
    queryFn: () => api.groups.getRequests(id),
    enabled: !!id && isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: ({ requestId, status }) => api.groups.approveRequest(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast("Request processed", "success");
    }
  });
`;

content = content.replace('const sortedPosts = [...posts].sort', requestQueries + '\n  const sortedPosts = [...posts].sort');

// 4. Update TABS
content = content.replace(
  'const TABS = ["posts", "people", "events", "about"];',
  'const TABS = ["posts", "people", "events", "about", ...(isAdmin && group?.privacy === "private" ? ["requests"] : [])];'
);

// 5. Update Join Button logic
const newJoinLogic = `
            {isMember ? (
              <button onClick={() => leaveMutation.mutate()} className="h-12 rounded-2xl border border-white/10 bg-white/5 px-6 font-bold text-white transition-colors hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30">
                Joined
              </button>
            ) : group?.has_requested ? (
              <button disabled className="h-12 rounded-2xl border border-white/10 bg-white/5 px-6 font-bold text-white/50 cursor-not-allowed">
                Requested
              </button>
            ) : (
              <button onClick={() => group?.privacy === 'private' ? setIsJoinModalOpen(true) : joinMutation.mutate()} className="h-12 rounded-2xl bg-[var(--rc-go)] px-8 font-bold text-black transition-colors hover:bg-[#b0eb38]">
                Join Circle
              </button>
            )}
`;
// Replace the old button logic
content = content.replace(/\{isMember \? \([\s\S]*?<\/button>\s*\)\}/, newJoinLogic.trim());

// 6. Fix mutation args
content = content.replace(
  'mutationFn: () => api.groups.join(id, ""),',
  'mutationFn: (msg = "") => api.groups.join(id, { message: msg }),'
);

// 7. Render Requests tab content
const requestsTabCode = `
          {/* REQUESTS TAB */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-24 text-center">
                  <p className="text-white/40 text-sm">No pending requests.</p>
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-4">
                      <img src={req.user?.profile?.profile_picture_url || \`https://ui-avatars.com/api/?name=\${req.user?.username}&background=random\`} alt="" className="h-12 w-12 rounded-full object-cover border border-white/10" />
                      <div>
                        <p className="font-bold text-white">{req.user?.profile?.full_name || req.user?.username}</p>
                        <p className="text-sm text-white/40 italic mt-1">"{req.message || "No message provided."}"</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveMutation.mutate({ requestId: req.id, status: 'rejected' })} className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"><X size={18} /></button>
                      <button onClick={() => approveMutation.mutate({ requestId: req.id, status: 'accepted' })} className="h-10 w-10 rounded-xl bg-[var(--rc-go)]/10 text-[var(--rc-go)] flex items-center justify-center hover:bg-[var(--rc-go)]/20 transition-colors"><Check size={18} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
`;
content = content.replace('{/* CONTENT */}', requestsTabCode); // wait, where to put it?
// I'll append it before `</div>\n      </div>\n      {isEditModalOpen`
content = content.replace(
  '        </div>\n      </div>\n      {isEditModalOpen',
  requestsTabCode + '\n        </div>\n      </div>\n      {isEditModalOpen'
);

content = content.replace(
  '{isEditModalOpen && <EditGroupModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} group={group} />}',
  '{isEditModalOpen && <EditGroupModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} group={group} />}\n      <AnimatePresence>{isJoinModalOpen && <JoinRequestModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onSubmit={(msg) => { setIsJoinModalOpen(false); joinMutation.mutate(msg); }} />}</AnimatePresence>'
);


fs.writeFileSync('frontend/pages/GroupDetails.jsx', content);
console.log('Patched GroupDetails with Request Flow');
