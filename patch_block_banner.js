import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Remove setSelectedChatId(null) and search params clear from blockUserMutation
c = c.replace(
    'queryClient.invalidateQueries(["currentUser"]);\n            toast("User blocked successfully", "success");\n            setSelectedChatId(null);\n            setSearchParams({}, { replace: true });',
    'queryClient.invalidateQueries(["currentUser"]);\n            toast("User blocked successfully", "success");'
);

// Inject unblockUserMutation
if (!c.includes('const unblockUserMutation')) {
    const blockMutationMatch = c.match(/const blockUserMutation = useMutation\(\{[\s\S]*?\}\);/);
    if (blockMutationMatch) {
        const unblockMutation = `
    const unblockUserMutation = useMutation({
        mutationFn: (userId) => api.users.unblockUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries(["chats"]);
            queryClient.invalidateQueries(["currentUser"]);
            toast("User unblocked", "success");
        },
        onError: () => toast("Failed to unblock user", "error")
    });`;
        c = c.replace(blockMutationMatch[0], blockMutationMatch[0] + '\n' + unblockMutation);
    }
}

// Replace footer rendering logic
const footerRegex = /<footer className="bg-\[#0a0a0c\]\/95 border-t border-white\/5 px-2 py-2 relative z-30 flex flex-col gap-2">/;
const newFooter = `{currentUser?.blockedUsers?.includes(String(activeChat?.partner?.id)) ? (
                                <footer className="bg-[#0a0a0c]/95 border-t border-red-500/10 px-4 py-5 relative z-30 flex flex-col items-center justify-center text-center gap-3">
                                    <p className="text-white/50 text-sm font-medium">You blocked this user. They cannot message you.</p>
                                    <button onClick={() => unblockUserMutation.mutate(activeChat.partner.id)} className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors">Unblock {activeChat.partner.fullName}</button>
                                </footer>
                            ) : (
                                <footer className="bg-[#0a0a0c]/95 border-t border-white/5 px-2 py-2 relative z-30 flex flex-col gap-2">`;

if (c.match(footerRegex)) {
    c = c.replace(footerRegex, newFooter);
    
    // Find the closing </footer> and add }
    // We need to find the specific closing footer for this block.
    // It is located after: </form>\n                            </footer>
    const closingFooterRegex = /<\/form>\s*<\/footer>/;
    c = c.replace(closingFooterRegex, `</form>\n                                </footer>\n                            )}`);
    console.log("Patched footer banner logic!");
} else {
    console.log("Could not find footer!");
}

fs.writeFileSync('frontend/pages/Messages.jsx', c);
