import fs from 'fs';

// 1. Add Delete Group route to backend
let backendContent = fs.readFileSync('backend/src/routes/groups.js', 'utf8');
const deleteGroupRoute = `
groupsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) throw notFound('Group not found.');
    if (group.creator_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      throw forbidden('Only the creator can delete this group.');
    }
    
    // Delete all related data
    await GroupMember.deleteMany({ group_id: group.id });
    await GroupRequest.deleteMany({ group_id: group.id });
    await Post.deleteMany({ group_id: group.id });
    await Group.deleteOne({ id: group.id });
    
    res.json({ success: true });
  })
);

groupsRouter.delete(
  '/:groupId/members/:userId',
`;
backendContent = backendContent.replace("groupsRouter.delete(\n  '/:groupId/members/:userId',", deleteGroupRoute);
// Handle Windows line endings
backendContent = backendContent.replace("groupsRouter.delete(\r\n  '/:groupId/members/:userId',", deleteGroupRoute);
fs.writeFileSync('backend/src/routes/groups.js', backendContent);

// 2. Add API method to frontend
let apiContent = fs.readFileSync('frontend/services/api.js', 'utf8');
const deleteApi = `
        delete: async (id) => {
            const res = await apiClient.delete(\`/groups/\${id}\`);
            return res.data;
        },
        getPosts: async (id) => {
`;
apiContent = apiContent.replace("getPosts: async (id) => {", deleteApi);
fs.writeFileSync('frontend/services/api.js', apiContent);

// 3. Add Delete Button to EditGroupModal
let modalContent = fs.readFileSync('frontend/components/groups/EditGroupModal.jsx', 'utf8');
const deleteButton = `
        <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
          <button 
            type="button"
            disabled={deleteMutation?.isPending}
            onClick={() => {
              if (window.confirm("Are you sure you want to completely delete this circle? This cannot be undone.")) {
                deleteMutation.mutate();
              }
            }}
            className="flex-1 rounded-2xl bg-red-500/10 py-4 font-bold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleteMutation?.isPending ? "Deleting..." : "Delete Circle"}
          </button>
          
          <button type="submit" disabled={updateGroupMutation.isPending} className="flex-[2] rounded-2xl bg-white py-4 font-black text-black transition-colors hover:bg-white/90 disabled:opacity-50">
            {updateGroupMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
`;
modalContent = modalContent.replace(
  /<button type="submit" disabled=\{updateGroupMutation\.isPending\} className="w-full rounded-2xl bg-white py-4 font-black text-black transition-all hover:bg-white\/90 active:scale-95 disabled:opacity-50">[\s\S]*?<\/button>/m,
  deleteButton
);

// We need to define deleteMutation in EditGroupModal
const deleteMutationDef = `
  const updateGroupMutation = useMutation({
    mutationFn: (data) => api.groups.update(group.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", group.id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast("Circle updated successfully", "success");
      onClose();
    },
    onError: (err) => toast(err.response?.data?.error || "Failed to update circle", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.groups.delete(group.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast("Circle deleted successfully", "success");
      onClose();
      // Redirect to groups list
      window.location.href = '/groups';
    },
    onError: (err) => toast(err.response?.data?.error || "Failed to delete circle", "error")
  });
`;
modalContent = modalContent.replace(
  /const updateGroupMutation = useMutation\(\{[\s\S]*?\}\);/m,
  deleteMutationDef
);

fs.writeFileSync('frontend/components/groups/EditGroupModal.jsx', modalContent);

console.log('Added Delete Circle feature');
