import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'const { user: currentUser } = useAuthStore();',
    'const { user: currentUser, updateUser } = useAuthStore();'
);

// Replace blockUserMutation onSuccess
const blockSuccess = `        onSuccess: () => {
            queryClient.invalidateQueries(["chats"]);
            queryClient.invalidateQueries(["currentUser"]);
            toast("User blocked successfully", "success");
        },`;
const newBlockSuccess = `        onSuccess: () => {
            queryClient.invalidateQueries(["chats"]);
            api.auth.me().then(u => { updateUser(u); queryClient.setQueryData(["currentUser"], u); });
            toast("User blocked successfully", "success");
        },`;
c = c.replace(blockSuccess, newBlockSuccess);

// Replace unblockUserMutation onSuccess
const unblockSuccess = `        onSuccess: () => {
            queryClient.invalidateQueries(["chats"]);
            queryClient.invalidateQueries(["currentUser"]);
            toast("User unblocked", "success");
        },`;
const newUnblockSuccess = `        onSuccess: () => {
            queryClient.invalidateQueries(["chats"]);
            api.auth.me().then(u => { updateUser(u); queryClient.setQueryData(["currentUser"], u); });
            toast("User unblocked", "success");
        },`;
c = c.replace(unblockSuccess, newUnblockSuccess);

// Replace toggleConversationMuteMutation onSuccess
const muteSuccess = `        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["currentUser"]);
            const isMuted = currentUser?.mutedConversations?.includes(String(variables));
            toast(isMuted ? "Conversation unmuted" : "Conversation muted", "success");
        },`;
const newMuteSuccess = `        onSuccess: (data, variables) => {
            api.auth.me().then(u => { updateUser(u); queryClient.setQueryData(["currentUser"], u); });
            const isMuted = currentUser?.mutedConversations?.includes(String(variables));
            toast(isMuted ? "Conversation unmuted" : "Conversation muted", "success");
        },`;
c = c.replace(muteSuccess, newMuteSuccess);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched Messages.jsx to update Zustand!");
