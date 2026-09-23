import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Messages } from '../../pages/Messages';

export const GroupChat = ({ groupId }) => {
    // Fetch conversation ID for this group
    const { data: chatInfo, isLoading: isChatLoading } = useQuery({
        queryKey: ['groupChat', groupId],
        queryFn: () => api.groups.getChat(groupId),
        enabled: !!groupId,
    });

    const conversationId = chatInfo?.conversation_id;

    if (isChatLoading) {
        return <div className="h-[400px] flex items-center justify-center text-white/50">Loading chat...</div>;
    }

    if (!conversationId) {
        return <div className="h-[400px] flex items-center justify-center text-white/50">Failed to load chat room.</div>;
    }

    return (
        <div className="border border-white/10 rounded-3xl overflow-hidden bg-[#030303]">
            <Messages embeddedChatId={conversationId} />
        </div>
    );
};
