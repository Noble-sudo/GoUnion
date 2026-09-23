import React, { useEffect, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store';
import { initSocket, getSocket } from '../utils/socket';
import { useToast } from './ui/Toast';
import { transformMessage, transformNotification } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            const socket = getSocket();
            if (socket) {
                socket.emit('user_offline', { userId: user?.id });
                socket.disconnect();
                window.socket = null;
            }
            return;
        }

        const socket = initSocket();

        // Authenticate the socket to join user room
        socket.emit('authenticate', { userId: String(user.id) });
        socket.emit('user_online', { userId: String(user.id) });

        const handleNewMessage = (data) => {
            const rawMsg = data.message || data;
            const convId = rawMsg.conversation_id || rawMsg.conversationId;
            if (!convId) return;
            const msg = transformMessage(rawMsg);
            
            // Append to the conversation messages query
            queryClient.setQueryData(['messages', String(convId)], (old) => {
                if (!old) return [msg];
                // Prevent duplicates
                if (old.some(m => String(m.id) === String(msg.id))) return old;
                return [...old, msg];
            });

            // Update chat list to bring it to top and show the latest message immediately
            queryClient.setQueryData(['chats'], (old) => {
                if (!old) return old;
                const index = old.findIndex(c => String(c.id) === String(convId));
                if (index === -1) return old;
                
                const updatedConvo = {
                    ...old[index],
                    lastMessage: msg.content || (msg.audioUrl ? 'Voice Note' : msg.videoUrl ? 'Video' : msg.imageUrl || msg.fileUrl ? 'Attachment' : 'New message'),
                    timestamp: msg.timestamp,
                    unreadCount: String(msg.senderId) === String(user.id) ? old[index].unreadCount : (old[index].unreadCount || 0) + 1,
                };
                
                const newConvos = [...old];
                newConvos.splice(index, 1);
                newConvos.unshift(updatedConvo);
                return newConvos;
            });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        };

        const handleNewGroupMessage = (data) => {
            const msg = data.message || data;
            const groupId = msg.group_id || msg.groupId;
            if (!groupId) return;

            queryClient.setQueryData(['group_messages', String(groupId)], (old) => {
                if (!old) return old;
                if (old.some(m => String(m.id) === String(msg.id))) return old;
                return [...old, msg];
            });
        };

        const handleNotification = (data) => {
            const notification = data.notification || data;
            const transformed = notification?.id ? transformNotification(notification) : null;
            if (transformed) {
                queryClient.setQueryData(['notifications'], (old = []) => {
                    if (old.some((item) => String(item.id) === String(transformed.id))) return old;
                    return [transformed, ...old];
                });
            }
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
            
            // Optionally show a toast for new notifications if not in messages
            if (transformed) {
                const actorName = transformed.actor?.fullName || transformed.actor?.username || 'Someone';
                const toastMessage = transformed.type === 'new_message' && transformed.groupId
                    ? transformed.message
                    : `${actorName} ${transformed.message}`;
                toast(toastMessage, 'info');
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('new_group_message', handleNewGroupMessage);
        socket.on('notification', handleNotification);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('new_group_message', handleNewGroupMessage);
            socket.off('notification', handleNotification);
        };
    }, [isAuthenticated, user?.id, queryClient, toast]);

    return (
        <SocketContext.Provider value={getSocket()}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
