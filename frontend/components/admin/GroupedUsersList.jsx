import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, MoreVertical, Edit2, ShieldAlert, Ban, CheckCircle2, Building2, X } from "lucide-react";
import { api } from "../../services/api";
import { Avatar } from "../ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

export const GroupedUsersList = ({ users = [], loading = false }) => {
  const [expandedInst, setExpandedInst] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editInstId, setEditInstId] = useState("");
  const queryClient = useQueryClient();

  const { data: institutions = [] } = useQuery({
    queryKey: ["institutions"],
    queryFn: api.institutions.getAll,
  });

  const institutionMutation = useMutation({
    mutationFn: ({ userId, institutionId }) => api.admin.updateInstitution(userId, institutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditUserId(null);
    },
  });

  // Group users by institution
  const grouped = users.reduce((acc, user) => {
    const instName = user.institution?.name || user.university || "Unassigned";
    const instId = user.institution?.id || "unassigned";
    if (!acc[instId]) acc[instId] = { name: instName, users: [] };
    acc[instId].users.push(user);
    return acc;
  }, {});

  if (loading) return <div className="p-8 text-center text-white/50 animate-pulse">Loading users...</div>;

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([instId, group]) => (
        <div key={instId} className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <button 
            onClick={() => setExpandedInst(expandedInst === instId ? null : instId)}
            className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{group.name}</h3>
                <p className="text-white/40 text-sm font-medium">{group.users.length} {group.users.length === 1 ? 'student' : 'students'}</p>
              </div>
            </div>
          </button>
          
          <AnimatePresence>
            {expandedInst === instId && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 border-t border-white/5 space-y-2">
                  {group.users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-white font-bold text-sm leading-tight">{user.fullName}</p>
                          <p className="text-white/40 text-xs font-medium">@{user.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/50'}`}>
                          {user.role}
                        </span>
                        
                        {editUserId === user.id ? (
                          <div className="flex items-center gap-2">
                            <select 
                              value={editInstId} 
                              onChange={(e) => setEditInstId(e.target.value)}
                              className="bg-[#111113] border border-white/10 rounded-lg text-white text-xs px-2 py-1"
                            >
                              <option value="">Unassigned</option>
                              {institutions.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => institutionMutation.mutate({ userId: user.id, institutionId: editInstId })}
                              disabled={institutionMutation.isPending}
                              className="p-1.5 bg-primary text-black rounded-lg hover:opacity-80"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button onClick={() => setEditUserId(null)} className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditUserId(user.id);
                              setEditInstId(user.institution?.id || "");
                            }}
                            className="p-2 text-white/40 hover:text-primary transition-colors bg-white/5 rounded-lg"
                            title="Change Institution"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
