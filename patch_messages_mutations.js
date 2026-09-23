import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Add mutations
const queryRegex = /const leaveGroupMutation = useMutation\(\{[\s\S]*?\}\);/;
const queryMatch = c.match(queryRegex);

if (queryMatch) {
    const mutations = `
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
        mutationFn: (muted) => api.users.updateSettings({ push_notifications: !muted }),
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
    });
`;
    c = c.replace(queryMatch[0], queryMatch[0] + '\n' + mutations);
} else {
    console.log("Could not find leaveGroupMutation!");
}

// Sidebar Global Mute
const sidebarMuteRegex = /onClick=\{\(\) => \{ setIsChatListMenuOpen\(false\); setNotificationsMuted\(!notificationsMuted\); toast\(notificationsMuted \? "Notifications unmuted" : "Notifications muted", "success"\); \}\}/;
const sidebarMuteReplace = `onClick={() => { setIsChatListMenuOpen(false); const willMute = currentUser?.settings?.push_notifications ?? true; toggleGlobalMuteMutation.mutate(willMute); }}`;
c = c.replace(sidebarMuteRegex, sidebarMuteReplace);

const sidebarTextRegex = /\{notificationsMuted \? <Bell size=\{15\} \/> : <BellOff size=\{15\} \/>\} \{notificationsMuted \? "Unmute Notifications" : "Mute Notifications"\}/;
const sidebarTextReplace = `{!(currentUser?.settings?.push_notifications ?? true) ? <Bell size={15} /> : <BellOff size={15} />} {!(currentUser?.settings?.push_notifications ?? true) ? "Unmute Notifications" : "Mute Notifications"}`;
c = c.replace(sidebarTextRegex, sidebarTextReplace);
c = c.replace(/className=\{\`flex items-center gap-3 px-3 py-2\.5 text-xs font-bold rounded-lg w-full text-left transition-colors \$\{notificationsMuted \? 'text-green-400 hover:text-green-300 hover:bg-green-500\/10' : 'text-red-400 hover:text-red-300 hover:bg-red-500\/10'\}\`\}/g, `className={\`flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg w-full text-left transition-colors \${!(currentUser?.settings?.push_notifications ?? true) ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}\`}`);


// Chat Header Block User
const blockRegex = /onClick=\{\(\) => \{ setIsChatMenuOpen\(false\); toast\(activeChat\?\.partner\?\.isGroup \? "Left group" : "User blocked", "success"\); \}\}/;
const blockReplace = `onClick={() => { setIsChatMenuOpen(false); if (activeChat?.partner?.isGroup) { leaveGroupMutation.mutate(activeChat.partner.id); } else { blockUserMutation.mutate(activeChat.partner.id); } }}`;
c = c.replace(blockRegex, blockReplace);

// Chat Header Mute Conversation
const muteConvRegex = /onClick=\{\(\) => \{ setIsChatMenuOpen\(false\); toast\("Notifications muted", "success"\); \}\}/;
const muteConvReplace = `onClick={() => { setIsChatMenuOpen(false); toggleConversationMuteMutation.mutate(activeChat.id); }}`;
c = c.replace(muteConvRegex, muteConvReplace);

const muteConvTextRegex = /<BellOff size=\{16\} \/> Mute Notifications/;
const muteConvTextReplace = `{currentUser?.mutedConversations?.includes(String(activeChat?.id)) ? <Bell size={16} /> : <BellOff size={16} />} {currentUser?.mutedConversations?.includes(String(activeChat?.id)) ? "Unmute Conversation" : "Mute Conversation"}`;
c = c.replace(muteConvTextRegex, muteConvTextReplace);


fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched Messages.jsx with real mutations!");
