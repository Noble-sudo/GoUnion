import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetMutation = `    const deleteMessageMutation = useMutation({`;
const newMutation = `    const leaveGroupMutation = useMutation({
        mutationFn: (groupId) => api.groups.leave(groupId),
        onSuccess: () => {
            queryClient.invalidateQueries(["chats"]);
            toast("You left the group", "success");
            navigate("/messages");
        },
        onError: () => toast("Failed to leave group", "error")
    });

    const deleteMessageMutation = useMutation({`;

c = c.replace(targetMutation, newMutation);

const targetButton = `<button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left" onClick={() => { setIsChatMenuOpen(false); toast(activeChat?.partner?.isGroup ? "Left group" : "User blocked", "success"); }}>`;
const newButton = `<button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left" onClick={() => { 
                                                    setIsChatMenuOpen(false); 
                                                    if (activeChat?.partner?.isGroup) {
                                                        if (window.confirm("Are you sure you want to leave this group?")) {
                                                            leaveGroupMutation.mutate(activeChat?.partner?.id);
                                                        }
                                                    } else {
                                                        toast("User blocked", "success");
                                                    }
                                                }}>`;

c = c.replace(targetButton, newButton);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Injected leave group functionality");
