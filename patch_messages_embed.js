import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// 1. Add embeddedChatId to the signature
content = content.replace(/export const Messages = \(\) => \{/, 'export const Messages = ({ embeddedChatId }) => {');

// 2. Change the params parsing
content = content.replace(/    const userIdFromQuery = searchParams\.get\("userId"\);\n    const queryUsername = searchParams\.get\("username"\) \|\| "";\n    const queryName = searchParams\.get\("name"\) \|\| queryUsername \|\| "New chat";\n    const queryAvatar = searchParams\.get\("avatar"\) \|\| "";/, `    const userIdFromQuery = embeddedChatId ? null : searchParams.get("userId");
    const chatIdFromQuery = embeddedChatId ? embeddedChatId : searchParams.get("chat");
    const queryUsername = embeddedChatId ? null : (searchParams.get("username") || "");
    const queryName = embeddedChatId ? null : (searchParams.get("name") || queryUsername || "New chat");
    const queryAvatar = embeddedChatId ? null : (searchParams.get("avatar") || "");`);

// 3. Update the layout
// Find: <div className="h-[100dvh] w-full bg-[#030303] text-white overflow-hidden">
content = content.replace(/<div className="h-\[100dvh\] w-full bg-\[#030303\] text-white overflow-hidden">/, `<div className={embeddedChatId ? "h-[75vh] min-h-[500px] w-full bg-transparent text-white overflow-hidden" : "h-[100dvh] w-full bg-[#030303] text-white overflow-hidden"}>`);

// Hide sidebar if embedded
// Find: <aside className={`w-full md:w-[390px] md:min-w-[390px] bg-[#050505]/95 border-r border-white/10 flex-col ${selectedChatId ? "hidden md:flex" : "flex"}`}>
content = content.replace(/<aside className=\{`w-full md:w-\[390px\] md:min-w-\[390px\] bg-\[#050505\]\/95 border-r border-white\/10 flex-col \$\{selectedChatId \? "hidden md:flex" : "flex"\}`\}>/, `<aside className={\`w-full md:w-[390px] md:min-w-[390px] bg-[#050505]/95 border-r border-white/10 flex-col \${selectedChatId ? "hidden md:flex" : "flex"} \${embeddedChatId ? "hidden md:hidden" : ""}\`}>`);

// 4. Hide header back arrow if embedded
// Find: <button onClick={() => { setSelectedChatId(null); setSearchParams({}, { replace: true }); }} className="md:hidden h-10 w-10 shrink-0 rounded-xl text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-center z-50">
content = content.replace(/<button onClick=\{\(\) => \{ setSelectedChatId\(null\); setSearchParams\(\{\}, \{ replace: true \}\); \}\} className="md:hidden h-10 w-10 shrink-0 rounded-xl text-white\/60 hover:text-white hover:bg-white\/5 flex items-center justify-center z-50">/, `<button onClick={() => { setSelectedChatId(null); if (!embeddedChatId) setSearchParams({}, { replace: true }); }} className={\`\${embeddedChatId ? 'hidden' : 'md:hidden'} h-10 w-10 shrink-0 rounded-xl text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-center z-50\`}>`);

// Add effect for chat selection
const existingUseEffectRegex = /    useEffect\(\(\) => \{[\s\S]*?\}, \[userIdFromQuery, queryUsername, queryName, queryAvatar, chats, createChatMutation\.isPending, createChatMutation, queryClient, setSearchParams\]\);/;

const originalUseEffect = content.match(existingUseEffectRegex)?.[0];
if (originalUseEffect) {
    const newUseEffect = `${originalUseEffect}

    useEffect(() => {
        if (!chatIdFromQuery || chatsLoading) return;
        
        const existingChat = chats.find(c => String(c.id) === String(chatIdFromQuery));
        if (existingChat) {
            setSelectedChatId(existingChat.id);
            if (!embeddedChatId) setSearchParams({}, { replace: true });
        } else {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            setSelectedChatId(chatIdFromQuery);
        }
    }, [chatIdFromQuery, chats, chatsLoading, setSearchParams, queryClient, embeddedChatId]);`;

    content = content.replace(existingUseEffectRegex, newUseEffect);
}

fs.writeFileSync('frontend/pages/Messages.jsx', content);
console.log("Patched Messages.jsx for embedding!");
