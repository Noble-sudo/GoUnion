import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Building2, Search, Plus, MapPin, Loader2, X, Save, Users, Radio, ShieldAlert, BarChart3, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store';

export default function CampusManager() {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampus, setEditingCampus] = useState(null);
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'edit'
    const [formData, setFormData] = useState({ name: '', slug: '', location: '', status: 'active' });
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((state) => state.user);

    const { data: institutions = [], isLoading } = useQuery({
        queryKey: ['admin_institutions_with_users'],
        queryFn: async () => {
            const [instRes, usersRes] = await Promise.all([
                api.institutions.getAll(),
                api.admin.getUsers()
            ]);
            
            // Calculate user counts per campus
            const userCounts = {};
            usersRes.forEach(u => {
                if (u.institution_id) {
                    userCounts[u.institution_id] = (userCounts[u.institution_id] || 0) + 1;
                }
            });
            const activeInstIds = new Set(Object.keys(userCounts));
            
            return instRes
                .filter(inst => activeInstIds.has(String(inst.id)))
                .map(inst => ({ ...inst, userCount: userCounts[inst.id] || 0 }))
                .sort((a, b) => b.userCount - a.userCount);
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.admin.createCampus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_institutions_with_users'] });
            setIsModalOpen(false);
            setEditingCampus(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.admin.updateCampus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_institutions_with_users'] });
            if (viewMode === 'edit') setViewMode('dashboard');
            else {
                setIsModalOpen(false);
                setEditingCampus(null);
            }
        }
    });

    const filtered = institutions.filter(i => 
        i.name.toLowerCase().includes(search.toLowerCase()) || 
        i.slug.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setFormData({ name: '', slug: '', location: '', status: 'active' });
        setEditingCampus(null);
        setViewMode('edit');
        setIsModalOpen(true);
    };

    const teleportMutation = useMutation({
        mutationFn: (id) => api.admin.switchCampus(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries();
            alert(`Teleported to ${data.institution.name}!`);
            window.location.reload();
        }
    });

    const handleTeleport = (campus) => {
        if(confirm(`Teleport into ${campus.name}? You will experience the app exactly as a student from this campus.`)) {
            teleportMutation.mutate(campus.id);
        }
    };

    const handleOpenManage = (campus) => {
        setEditingCampus(campus);
        setFormData({ name: campus.name, slug: campus.slug, location: campus.location || '', status: campus.status || 'active' });
        setViewMode('dashboard');
        setIsModalOpen(true);
    };
    
    const handleToggleStatus = () => {
        const newStatus = editingCampus.status === 'suspended' ? 'active' : 'suspended';
        updateMutation.mutate({ 
            id: editingCampus.id, 
            data: { ...editingCampus, status: newStatus } 
        });
        setEditingCampus({ ...editingCampus, status: newStatus });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">Campus Command Center</h2>
                    <p className="text-white/50 text-sm mt-1">Monitor, manage, and govern active universities.</p>
                </div>
                <button 
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    Add Campus
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search active campuses..." 
                    className="w-full bg-[#111114] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-[#111114] rounded-2xl border border-white/5">
                    <Building2 size={48} className="mx-auto text-white/20 mb-4" />
                    <h3 className="text-white font-bold text-lg mb-2">No Active Campuses</h3>
                    <p className="text-white/50 text-sm">There are no universities matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((campus) => (
                        <div key={campus.id} className="bg-[#111114] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                    {campus.logo_url ? (
                                        <img src={campus.logo_url} alt="" className="h-8 w-8 object-contain" />
                                    ) : (
                                        <Building2 size={24} className="text-white/40" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-base leading-tight">{campus.name}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                            <MapPin size={12} />
                                            <span>{campus.location || "Nigeria"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                                            <Users size={12} />
                                            <span>{campus.userCount} Students</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${campus.status === 'suspended' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {campus.status === 'suspended' ? 'Suspended' : 'Active'}
                                </span>
                                {['admin', 'moderator'].includes(currentUser?.role) && (
                                    <button 
                                        onClick={() => handleTeleport(campus)}
                                        className="text-xs font-bold text-white hover:text-blue-400 transition-colors mr-3"
                                    >
                                        Teleport
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleOpenManage(campus)}
                                    className="text-xs font-bold text-white hover:text-primary transition-colors"
                                >
                                    Manage Campus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111114] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0a0a0c]">
                                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                    {viewMode === 'edit' && editingCampus ? 'Edit Details' : 
                                     viewMode === 'edit' ? 'Add New Campus' : 
                                     <><Building2 size={20} className="text-primary"/> Campus Dashboard</>}
                                </h3>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {/* Dashboard View */}
                            {viewMode === 'dashboard' && editingCampus && (
                                <div className="p-6">
                                    {/* Header Profile */}
                                    <div className="flex flex-col items-center text-center mb-8">
                                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                                            <Building2 size={28} className="text-white/60" />
                                        </div>
                                        <h2 className="text-xl font-black text-white leading-tight">{editingCampus.name}</h2>
                                        <p className="text-sm text-white/50 mt-1">{editingCampus.location || 'Location Not Set'}</p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-4 text-center">
                                            <Users size={20} className="text-blue-400 mx-auto mb-2" />
                                            <div className="text-xl font-black text-white">{editingCampus.userCount}</div>
                                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Students</div>
                                        </div>
                                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-4 text-center opacity-50">
                                            <BarChart3 size={20} className="text-green-400 mx-auto mb-2" />
                                            <div className="text-xl font-black text-white">--</div>
                                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Groups</div>
                                        </div>
                                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-4 text-center opacity-50">
                                            <Radio size={20} className="text-purple-400 mx-auto mb-2" />
                                            <div className="text-xl font-black text-white">--</div>
                                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Posts</div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2">Campus Actions</p>
                                        
                                        <button 
                                            onClick={() => setViewMode('edit')}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a0a0c] hover:bg-white/5 hover:border-white/10 transition-colors text-left group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-white/5 text-white group-hover:bg-white/10">
                                                    <Edit3 size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-white">Edit Campus Details</div>
                                                    <div className="text-xs text-white/50">Update name, shortcode, and location</div>
                                                </div>
                                            </div>
                                        </button>

                                        <button 
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a0a0c] hover:bg-white/5 hover:border-white/10 transition-colors text-left group opacity-50 cursor-not-allowed"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                                                    <ShieldAlert size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-white">Appoint Ambassador</div>
                                                    <div className="text-xs text-white/50">Grant admin privileges to a student</div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Soon</span>
                                        </button>

                                        <button 
                                            onClick={handleToggleStatus}
                                            disabled={updateMutation.isPending}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors text-left group ${editingCampus.status === 'suspended' ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${editingCampus.status === 'suspended' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    <ShieldAlert size={18} />
                                                </div>
                                                <div>
                                                    <div className={`font-bold text-sm ${editingCampus.status === 'suspended' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {editingCampus.status === 'suspended' ? 'Unsuspend Campus' : 'Suspend Campus'}
                                                    </div>
                                                    <div className={`text-xs ${editingCampus.status === 'suspended' ? 'text-green-400/60' : 'text-red-400/60'}`}>
                                                        {editingCampus.status === 'suspended' ? 'Restore access to feed and posts' : 'Freeze all activity and hide feed'}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Edit Form View */}
                            {viewMode === 'edit' && (
                                <form onSubmit={(e) => { e.preventDefault(); editingCampus ? updateMutation.mutate({ id: editingCampus.id, data: formData }) : createMutation.mutate(formData); }} className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2">Campus Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="e.g. University of Nigeria, Nsukka"
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2">Slug (Shortcode)</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.slug}
                                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                            placeholder="e.g. unn"
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2">Location</label>
                                        <input 
                                            type="text" 
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            placeholder="e.g. Enugu State"
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    
                                    <div className="pt-6 flex gap-3">
                                        {editingCampus && (
                                            <button 
                                                type="button"
                                                onClick={() => setViewMode('dashboard')}
                                                className="px-6 py-3.5 rounded-xl font-bold text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                                            >
                                                Back
                                            </button>
                                        )}
                                        <button 
                                            type="submit"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="flex-1 bg-primary text-black px-6 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {createMutation.isPending || updateMutation.isPending ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {editingCampus ? 'Save Changes' : 'Add Campus'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
