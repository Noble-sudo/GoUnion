const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/CampusManager.jsx', 'utf8');

const teleportFunction = `    const teleportMutation = useMutation({
        mutationFn: (id) => api.admin.switchCampus(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries();
            alert(\`Teleported to \${data.institution.name}!\`);
            window.location.reload();
        }
    });

    const handleTeleport = (campus) => {
        if(confirm(\`Teleport into \${campus.name}? You will experience the app exactly as a student from this campus.\`)) {
            teleportMutation.mutate(campus.id);
        }
    };

    const handleOpenManage =`;

content = content.replace('    const handleOpenManage =', teleportFunction);

const teleportButton = `<button 
                                    onClick={() => handleTeleport(campus)}
                                    className="text-xs font-bold text-white hover:text-blue-400 transition-colors mr-3"
                                >
                                    Teleport
                                </button>
                                <button 
                                    onClick={() => handleOpenManage(campus)}`;

content = content.replace(/<button\s*onClick=\{\(\) => handleOpenManage\(campus\)\}/, teleportButton);

// Also remove "Suspend Campus" from handleOpenManage modal?
// The user said: "then remove the suspend accounnt action in the super admin"
// So they meant Suspend Account in UserDirectory, not Suspend Campus.
fs.writeFileSync('frontend/components/admin/CampusManager.jsx', content);
console.log('Added Teleport button');
