import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);',
    'const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);\n    const [leftGroupChat, setLeftGroupChat] = useState(null);'
);

c = c.replace(
    'const activeChat = selectedChat || (pendingChat?.id === selectedChatId ? pendingChat : null);',
    'const activeChat = selectedChat || (pendingChat?.id === selectedChatId ? pendingChat : null) || (leftGroupChat?.id === selectedChatId ? leftGroupChat : null);'
);

const oldMutation = `    const leaveGroupMutation = useMutation({
        mutationFn: (groupId) => api.groups.leave(groupId),
        onSuccess: () => {
            queryClient.invalidateQueries(["chats"]);
            toast("You left the group", "success");
            navigate("/messages");
        },
        onError: () => toast("Failed to leave group", "error")
    });`;

const newMutation = `    const leaveGroupMutation = useMutation({
        mutationFn: (groupId) => api.groups.leave(groupId),
        onSuccess: (_, groupId) => {
            const leftChat = chats?.find(c => String(c?.partner?.id) === String(groupId) || String(c?.id) === String(groupId));
            if (leftChat) setLeftGroupChat({...leftChat, isLeft: true});
            queryClient.invalidateQueries(["chats"]);
            toast("You left the group", "success");
        },
        onError: () => toast("Failed to leave group", "error")
    });`;

c = c.replace(oldMutation, newMutation);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched leftGroupChat state");
