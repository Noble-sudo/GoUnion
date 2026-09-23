import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Check, X, AlertCircle } from 'lucide-react';
import { formatTimeAgo } from '../../utils/format';

export const SuspensionAppeals = () => {
    const queryClient = useQueryClient();

    const { data: appeals = [], isLoading, error } = useQuery({
        queryKey: ['admin_appeals'],
        queryFn: api.admin.getAppeals,
    });

    const resolveMutation = useMutation({
        mutationFn: ({ id, status }) => api.admin.resolveAppeal(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin_appeals']);
        },
    });

    if (isLoading) {
        return <div className="text-white/50 p-6">Loading appeals...</div>;
    }

    if (error) {
        return (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-center gap-3">
                <AlertCircle size={20} />
                <p>Failed to load appeals. Please try again.</p>
            </div>
        );
    }

    if (appeals.length === 0) {
        return (
            <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-12 text-center">
                <p className="text-white/50 text-sm">No pending suspension appeals at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-serif text-white">Suspension Appeals</h2>
            <div className="grid gap-4">
                {appeals.map((appeal) => (
                    <div key={appeal.id} className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-5 md:p-6 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={appeal.user?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appeal.user?.username}`}
                                        alt=""
                                        className="w-12 h-12 rounded-full border border-white/10"
                                    />
                                    <div>
                                        <h3 className="font-bold text-white">{appeal.user?.full_name || appeal.user?.username}</h3>
                                        <p className="text-xs text-white/40">@{appeal.user?.username} &bull; {appeal.user?.email}</p>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end">
                                        <span className="text-xs text-white/30">{formatTimeAgo(appeal.created_at)}</span>
                                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md mt-1 ${
                                            appeal.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                            appeal.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                            {appeal.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                                        <h4 className="text-[10px] uppercase tracking-widest text-red-400 mb-2">Suspension Reason</h4>
                                        <p className="text-sm text-red-200/80">{appeal.suspension_reason || 'No reason provided'}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">User's Appeal</h4>
                                        <p className="text-sm text-white/80">{appeal.appeal_text || 'No appeal text provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {appeal.status === 'pending' && (
                                <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                                    <button 
                                        onClick={() => resolveMutation.mutate({ id: appeal.id, status: 'resolved' })}
                                        disabled={resolveMutation.isPending}
                                        className="w-full flex items-center justify-center gap-2 bg-[var(--rc-go)]/10 hover:bg-[var(--rc-go)]/20 text-[var(--rc-go)] border border-[var(--rc-go)]/20 px-4 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50"
                                    >
                                        <Check size={16} /> Approve (Restore)
                                    </button>
                                    <button 
                                        onClick={() => resolveMutation.mutate({ id: appeal.id, status: 'rejected' })}
                                        disabled={resolveMutation.isPending}
                                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50"
                                    >
                                        <X size={16} /> Reject Appeal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuspensionAppeals;
