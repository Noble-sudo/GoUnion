import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// We need to add chatIdFromQuery to the searchParams
content = content.replace(/    const userIdFromQuery = searchParams\.get\("userId"\);/g, `    const userIdFromQuery = searchParams.get("userId");
    const chatIdFromQuery = searchParams.get("chat");`);

// And we need to add a useEffect to handle it
const existingUseEffectRegex = /    useEffect\(\(\) => \{[\s\S]*?\}, \[userIdFromQuery, queryUsername, queryName, queryAvatar, chats, createChatMutation\.isPending, createChatMutation, queryClient, setSearchParams\]\);/;

const originalUseEffect = content.match(existingUseEffectRegex)?.[0];
if (originalUseEffect) {
    const newUseEffect = `${originalUseEffect}

    useEffect(() => {
        if (!chatIdFromQuery || chatsLoading) return;
        
        const existingChat = chats.find(c => String(c.id) === String(chatIdFromQuery));
        if (existingChat) {
            setSelectedChatId(existingChat.id);
            setSearchParams({}, { replace: true });
        } else {
            // Group chat might not be in the initial chats list if we just created it.
            // Let's refetch chats to be safe.
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            setSelectedChatId(chatIdFromQuery);
        }
    }, [chatIdFromQuery, chats, chatsLoading, setSearchParams, queryClient]);`;

    content = content.replace(existingUseEffectRegex, newUseEffect);
    fs.writeFileSync('frontend/pages/Messages.jsx', content);
    console.log("Patched Messages.jsx to handle ?chat=");
} else {
    console.log("Could not find useEffect in Messages.jsx");
}
