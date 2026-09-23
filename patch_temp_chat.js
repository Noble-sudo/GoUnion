import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetEffect = `    useEffect(() => {
        if (!chatIdFromQuery || chatsLoading) return;
        
        const existingChat = chats.find(c => String(c?.id) === String(chatIdFromQuery));
        if (existingChat) {
            setSelectedChatId(existingChat.id);
            setPendingChat(null);
            return;
        }
        
        if (chatIdFromQuery.startsWith("temp-")) {
            setSelectedChatId(chatIdFromQuery);
        }
    }, [chatIdFromQuery, chats, chatsLoading, setSearchParams, queryClient, embeddedChatId]);`;

const newEffect = `    useEffect(() => {
        if (!chatIdFromQuery || chatsLoading) return;
        
        const existingChat = chats.find(c => String(c?.id) === String(chatIdFromQuery));
        if (existingChat) {
            setSelectedChatId(existingChat.id);
            setPendingChat(null);
            return;
        }
        
        if (chatIdFromQuery.startsWith("temp-")) {
            const partnerId = chatIdFromQuery.replace("temp-", "");
            const realChat = chats.find(c => String(c?.partner?.id) === partnerId && !c.isGroup);
            if (realChat) {
                // The temp chat has become a real chat! Switch to it automatically so messages load.
                setSelectedChatId(realChat.id);
                setPendingChat(null);
                if (!embeddedChatId) {
                    setSearchParams({ chat: realChat.id }, { replace: true });
                }
                return;
            }
            setSelectedChatId(chatIdFromQuery);
        }
    }, [chatIdFromQuery, chats, chatsLoading, setSearchParams, queryClient, embeddedChatId]);`;

c = c.replace(targetEffect, newEffect);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched temp chat transition");
