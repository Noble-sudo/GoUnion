import React, { useState } from 'react';
import { Radio, Send, Users, Globe, Building2 } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function BroadcastCenter() {
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('global');
    const [isSending, setIsSending] = useState(false);

    const { data: activeCampuses = [], isLoading } = useQuery({
        queryKey: ['admin_active_campuses'],
        queryFn: async () => {
            const [instRes, usersRes] = await Promise.all([
                api.institutions.getAll(),
                api.admin.getUsers()
            ]);
            const activeInstIds = new Set(usersRes.filter(u => u.institution_id).map(u => String(u.institution_id)));
            return instRes.filter(inst => activeInstIds.has(String(inst.id)));
        }
    });

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) return;
        setIsSending(true);
        try {
            const payload = {
                title,
                message,
                audience,
                institution_id: audience === 'campus' ? document.querySelector('select[name="campus_select"]').value : null
            };
            if (audience === 'campus' && !payload.institution_id) {
                toast("Please select a campus.", "error");
                setIsSending(false);
                return;
            }
            await api.admin.broadcast(payload);
            toast('Broadcast sent successfully!', 'success');
            setTitle('');
            setMessage('');
        } catch (error) {
            toast('Failed to send broadcast.', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                    <Radio className="text-primary" /> Broadcast Center
                </h2>
                <p className="text-white/50 text-sm mt-2">Send system-wide announcements or targeted campus alerts directly to users' devices.</p>
            </div>

            <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                
                {/* Audience Selection */}
                <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Target Audience</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button 
                            onClick={() => setAudience('global')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${audience === 'global' ? 'bg-primary/10 border-primary text-primary' : 'bg-[#0a0a0c] border-white/5 text-white/50 hover:border-white/20'}`}
                        >
                            <Globe size={24} className="mb-2" />
                            <span className="font-bold text-sm">Global Broadcast</span>
                            <span className="text-xs opacity-70 mt-1">All universities</span>
                        </button>
                        <button 
                            onClick={() => setAudience('campus')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${audience === 'campus' ? 'bg-primary/10 border-primary text-primary' : 'bg-[#0a0a0c] border-white/5 text-white/50 hover:border-white/20'}`}
                        >
                            <Building2 size={24} className="mb-2" />
                            <span className="font-bold text-sm">Targeted Campus</span>
                            <span className="text-xs opacity-70 mt-1">Select a university</span>
                        </button>
                    </div>
                </div>

                {audience === 'campus' && (
                    <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Select Campus</label>
                        <select name="campus_select" className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50">
                            <option value="">-- Choose University --</option>
                            {isLoading ? (
                                <option value="" disabled>Loading active campuses...</option>
                            ) : activeCampuses.length === 0 ? (
                                <option value="" disabled>No campuses have verified users yet.</option>
                            ) : (
                                activeCampuses.map(campus => (
                                    <option key={campus.id} value={campus.id}>{campus.name}</option>
                                ))
                            )}
                        </select>
                    </div>
                )}

                {/* Message Content */}
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Announcement Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Platform Maintenance Update"
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Message Body</label>
                        <textarea 
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Type your broadcast message here..."
                            rows={4}
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 resize-none"
                        ></textarea>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <Users size={14} />
                        <span>Estimated reach: {audience === 'global' ? '~25,000+ users' : '~4,000 users'}</span>
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={isSending || !title.trim() || !message.trim()}
                        className="bg-primary text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? 'Transmitting...' : (
                            <><Send size={16} /> Send Broadcast</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
