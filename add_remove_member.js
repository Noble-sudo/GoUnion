import fs from 'fs';

let content = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

// 1. Add removeMemberMutation
const removeMutationLogic = `
  const removeMemberMutation = useMutation({
    mutationFn: (userId) => api.groups.leave(id, userId), // reusing the leave endpoint which accepts userId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast("Member removed successfully", "success");
    },
    onError: () => toast("Failed to remove member", "error")
  });
`;

content = content.replace(
  'const leaveMutation = useMutation({',
  removeMutationLogic + '\n  const leaveMutation = useMutation({'
);

// 2. Add Kick button to Members list
const membersListNew = `
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map(member => (
                  <div key={member.user_id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                    <Link to={\`/profile/\${member.user?.username}\`} className="flex-1 flex items-center gap-3 min-w-0">
                      <img src={member.user?.profile?.profile_picture_url || \`https://ui-avatars.com/api/?name=\${member.user?.username}&background=random\`} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-bold text-sm text-white">{member.user?.profile?.full_name || member.user?.username}</p>
                        <p className="truncate text-xs text-white/40 capitalize">{member.role || 'Member'}</p>
                      </div>
                    </Link>
                    {isAdmin && member.user_id !== user?.id && (
                      <button 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to remove this member?")) {
                            removeMemberMutation.mutate(member.user_id);
                          }
                        }}
                        disabled={removeMemberMutation.isPending}
                        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Remove Member"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
`;

content = content.replace(
  /<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">[\s\S]*?<\/div>/m,
  membersListNew
);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', content);

// 3. Fix the frontend API so leave() can take an optional userId parameter for admins
let apiContent = fs.readFileSync('frontend/services/api.js', 'utf8');
apiContent = apiContent.replace(
  'leave: async (id) => {\n            const res = await apiClient.delete(`/groups/${id}/members/me`);',
  'leave: async (id, userId = "me") => {\n            const res = await apiClient.delete(`/groups/${id}/members/${userId}`);'
);
fs.writeFileSync('frontend/services/api.js', apiContent);

console.log('Added remove member feature');
