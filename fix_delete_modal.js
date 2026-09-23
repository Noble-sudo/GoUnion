import fs from 'fs';

let content = fs.readFileSync('frontend/components/groups/EditGroupModal.jsx', 'utf8');

// The correct submit button block looks like this:
//          <button 
//            type="submit" 
//            disabled={updateMutation.isPending}
//            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-black hover:bg-primary/90 transition-colors disabled:opacity-50"
//          >
//            {updateMutation.isPending ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : "Save Changes"}
//          </button>

const regex = /<button[\s\S]*?type="submit"[\s\S]*?disabled=\{updateMutation\.isPending\}[\s\S]*?>[\s\S]*?<\/button>/m;

const replacement = `
        <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
          <button 
            type="button"
            disabled={deleteMutation?.isPending}
            onClick={() => {
              if (window.confirm("Are you sure you want to completely delete this circle? This cannot be undone.")) {
                deleteMutation.mutate();
              }
            }}
            className="flex-1 rounded-xl bg-red-500/10 py-4 font-bold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleteMutation?.isPending ? "Deleting..." : "Delete Circle"}
          </button>
          
          <button 
            type="submit" 
            disabled={updateMutation.isPending} 
            className="flex-[2] rounded-xl bg-primary py-4 font-bold text-black hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
`;

content = content.replace(regex, replacement);

// We need to add the deleteMutation inside the component
const mutationRegex = /const updateMutation = useMutation\(\{[\s\S]*?\}\);/m;
const mutationReplacement = `
  const updateMutation = useMutation({
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
      window.location.href = '/groups';
    },
    onError: (err) => toast(err.response?.data?.error || "Failed to delete circle", "error")
  });
`;

content = content.replace(mutationRegex, mutationReplacement);

fs.writeFileSync('frontend/components/groups/EditGroupModal.jsx', content);
console.log('Fixed Delete Button in EditGroupModal');
