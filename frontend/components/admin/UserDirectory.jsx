import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { 
  Search, 
  ShieldAlert, 
  Shield, 
  CheckCircle, 
  Ban,
  UserCog,
  UserCheck,
  UserX,
  Building2,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserDirectory() {
  const { data: institutions = [] } = useQuery({ queryKey: ['admin_institutions'], queryFn: api.institutions.getAll });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [institutionFilter, setInstitutionFilter] = useState('All');

  
    const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['users-admin'],
    queryFn: () => api.admin.getUsers(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => api.admin.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users-admin'] }),
  });

  
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, reason }) => api.admin.toggleActive(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users-admin'] }),
  });

  const handlePromote = (id, role) => {
    updateRoleMutation.mutate({ id, role });
  };

  const handleToggleStatus = (id, isActive) => {
    let reason = null;
    if (isActive) {
        reason = window.prompt("Enter a reason for suspending this user:");
        if (reason === null) return; // User cancelled
    }
    toggleActiveMutation.mutate({ id, reason });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  
  const activeInstitutions = useMemo(() => {
        const instIds = new Set(users.filter(u => u.institution_id).map(u => u.institution_id));
        return institutions.filter(inst => instIds.has(inst.id));
    }, [users, institutions]);

  const groupedUsers = useMemo(() => {
      let filtered = users.filter(user => {
        const matchesSearch = 
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.university?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const isActive = user.isActive ?? true;
        const matchesStatus = statusFilter === 'All' 
            ? true 
            : statusFilter === 'Active' ? isActive : !isActive;
            
        // Exclude unassigned students (keep admins/moderators or verified users)
        const matchesInst = institutionFilter === 'All' || user.institution_id === institutionFilter;
          return matchesSearch && matchesRole && matchesStatus && matchesInst;
      });

    const groups = {};
          filtered.forEach(user => {
        let groupName = 'Unassigned';
        
        if (user.role === 'admin' || user.role === 'moderator' || user.email?.includes('ezeilodavid292')) {
            groupName = 'Platform Admin / Staff';
        } else if (user.institution_id) {
            const inst = institutions.find(i => i.id === user.institution_id);
            if (inst) {
                groupName = inst.name;
            } else {
                groupName = user.university || 'University Student';
            }
        } else {
            groupName = 'Unassigned / Pending Verification';
        }
        
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(user);
      });

      // Sort groups alphabetically, but put Platform Admins and Unassigned at the end
    return Object.entries(groups).sort(([a], [b]) => {
      if (a.includes('Admin')) return -1;
      if (b.includes('Admin')) return 1;
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b);
    });
  }, [users, searchQuery, roleFilter, statusFilter, institutionFilter, institutions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Search by name, username, email, institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none flex-1 md:flex-none cursor-pointer max-w-xs"
          >
            <option value="All">All Campuses</option>
            {activeInstitutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none flex-1 md:flex-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
                        <option value="user">User</option>
          </select>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none flex-1 md:flex-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">User & Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            
            {isLoading ? (
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-white/50">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : isError ? (
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-red-400">
                    Failed to load users. Please try again.
                  </td>
                </tr>
              </tbody>
            ) : groupedUsers.length === 0 ? (
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-white/50">
                    No users found matching your filters.
                  </td>
                </tr>
              </tbody>
            ) : (
              groupedUsers.map(([groupName, groupUsers]) => (
                <tbody key={groupName} className="divide-y divide-white/5">
                  <tr className="bg-white/[0.02] border-t border-b border-white/5">
                    <td colSpan="5" className="px-6 py-3">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <Building2 className="w-4 h-4 text-primary" />
                        {groupName}
                        <span className="text-white/40 text-xs ml-2 font-normal bg-white/5 px-2 py-0.5 rounded-full">
                          {groupUsers.length} users
                        </span>
                      </div>
                    </td>
                  </tr>
                  {groupUsers.map(user => (
                    <motion.tr 
                      key={user.id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                          <div className="flex flex-col">
                            <div className="font-bold text-white">{user.fullName}</div>
                            <div className="text-xs text-white/50">@{user.username}</div>
                            {user.email && (
                              <div className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-red-500/10 text-red-400"><ShieldAlert size={12}/> Admin</span>
                        ) : user.role === 'moderator' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400"><Shield size={12}/> Mod</span>
                        ) : (
                          <span className="text-white/50 text-xs">User</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ?? true ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-green-500/10 text-green-400"><CheckCircle size={12}/> Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-white/10 text-white/50"><Ban size={12}/> Suspended</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white/50">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.email === 'ezeilodavid292@gmail.com' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400" title="Super Admin — permanently locked">
                              <Shield size={12} /> Locked
                            </span>
                          ) : (<>
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => handlePromote(user.id, 'admin')}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                              title="Promote to Admin"
                            >
                              <UserCog size={16} />
                            </button>
                          )}
                          {user.role === 'admin' && (
                            <button 
                              onClick={() => handlePromote(user.id, 'user')}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Revoke Admin"
                            >
                              <UserX size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleToggleStatus(user.id, user.isActive ?? true)}
                            className={`p-1.5 rounded-lg ${user.isActive ?? true ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-red-500/10 hover:bg-green-500/20 text-red-400 hover:text-green-400'} transition-colors`}
                            title={user.isActive ?? true ? "Suspend User" : "Reactivate User"}
                          >
                            <Ban size={16} />
                          </button>
                          </>)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              ))
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
