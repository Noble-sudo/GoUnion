import fs from 'fs';

let c = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

const updatedMutation = `
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, reason }) => api.admin.toggleActive(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users-admin'] }),
  });

  const handlePromote = (id, role) => {
    updateRoleMutation.mutate({ id, role });
  };

  const handleToggleStatus = (id, isActive) => {
    let reason = null;
    if (isActive) {
        reason = window.prompt("Enter a reason for suspending this user:");
        if (reason === null) return; // User cancelled
    }
    toggleActiveMutation.mutate({ id, reason });
  };
`;

c = c.replace(/const toggleActiveMutation = useMutation\(\{[\s\S]*?const handleToggleStatus = \(id\) => \{\s*toggleActiveMutation\.mutate\(id\);\s*\};\n/m, updatedMutation);

c = c.replace(/onClick=\{\(\) => handleToggleStatus\(user\.id\)\}/g, "onClick={() => handleToggleStatus(user.id, user.isActive ?? true)}");

fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', c);
console.log('Updated UserDirectory.jsx for suspension reason');
