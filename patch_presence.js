import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'import { api, getApiErrorMessage } from "../services/api";',
    'import { api, getApiErrorMessage, socket } from "../services/api";'
);

const effectCode = `    useEffect(() => {
        const handleUserOnline = ({ userId }) => {
            queryClient.setQueryData(["chats"], (old) => {
                if (!old) return old;
                return old.map(chat => {
                    if (String(chat.partner?.id) === String(userId)) {
                        return { ...chat, partner: { ...chat.partner, isOnline: true } };
                    }
                    if (chat.partner?.isGroup && chat.participants) {
                        const updatedParticipants = chat.participants.map(p => String(p.id) === String(userId) ? { ...p, isOnline: true } : p);
                        const onlineCount = updatedParticipants.filter(p => p.isOnline).length;
                        return { ...chat, participants: updatedParticipants, partner: { ...chat.partner, onlineCount } };
                    }
                    return chat;
                });
            });
        };
        const handleUserOffline = ({ userId, lastSeen }) => {
            queryClient.setQueryData(["chats"], (old) => {
                if (!old) return old;
                return old.map(chat => {
                    if (String(chat.partner?.id) === String(userId)) {
                        const date = lastSeen ? new Date(lastSeen) : new Date();
                        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return { ...chat, partner: { ...chat.partner, isOnline: false, lastSeen: timeString } };
                    }
                    if (chat.partner?.isGroup && chat.participants) {
                        const updatedParticipants = chat.participants.map(p => String(p.id) === String(userId) ? { ...p, isOnline: false } : p);
                        const onlineCount = updatedParticipants.filter(p => p.isOnline).length;
                        return { ...chat, participants: updatedParticipants, partner: { ...chat.partner, onlineCount } };
                    }
                    return chat;
                });
            });
        };
        
        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);
        return () => {
            socket.off('user_online', handleUserOnline);
            socket.off('user_offline', handleUserOffline);
        };
    }, [queryClient]);
`;

const insertIndex = c.indexOf('const selectedChat = chats.find');
c = c.substring(0, insertIndex) + effectCode + '\n    ' + c.substring(insertIndex);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched online presence listeners");
