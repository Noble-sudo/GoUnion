import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const match = c.match(/const deleteMessageMutation = useMutation\(\{[\s\S]*?\}\);/);
if (match) {
    const mutations = `
    const leaveGroupMutation = useMutation({
        mutationFn: (groupId) => api.chats.leaveGroup(groupId),
        onSuccess: (_, groupId) => {
            queryClient.invalidateQueries(["chats"]);
            toast("You left the group", "success");
            setSelectedChatId(null);
        },
        onError: () => toast("Failed to leave group", "error")
    });

    const blockUserMutation = useMutation({
        mutationFn: (userId) => api.users.blockUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries(["chats"]);
            queryClient.invalidateQueries(["currentUser"]);
            toast("User blocked successfully", "success");
            setSelectedChatId(null);
            setSearchParams({}, { replace: true });
        },
        onError: () => toast("Failed to block user", "error")
    });

    const toggleGlobalMuteMutation = useMutation({
        mutationFn: (willMute) => api.users.updateSettings({ push_notifications: !willMute }),
        onSuccess: (data) => {
            queryClient.setQueryData(["currentUser"], data);
            toast(data.settings.push_notifications ? "Notifications unmuted" : "Notifications muted", "success");
        },
        onError: () => toast("Failed to update notification settings", "error")
    });

    const toggleConversationMuteMutation = useMutation({
        mutationFn: (conversationId) => {
            const isMuted = currentUser?.mutedConversations?.includes(String(conversationId));
            return isMuted ? api.chats.unmuteConversation(conversationId) : api.chats.muteConversation(conversationId);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["currentUser"]);
            const isMuted = currentUser?.mutedConversations?.includes(String(variables));
            toast(isMuted ? "Conversation unmuted" : "Conversation muted", "success");
        },
        onError: () => toast("Failed to update conversation settings", "error")
    });`;
    c = c.replace(match[0], match[0] + '\n' + mutations);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log('Injected mutations');
} else {
    console.log('deleteMessageMutation not found');
}
