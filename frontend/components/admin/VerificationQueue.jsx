import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../ui/Toast';
import { api } from '../../services/api';
import { Shield, XCircle, CheckCircle2, Clock, Mail, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VerificationQueue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedIdentity, setSelectedIdentity] = useState(null);

  const { data: identities = [], isLoading } = useQuery({
    queryKey: ['admin-identities'],
    queryFn: api.admin.getPendingIdentities,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, action, reason }) => api.admin.resolveIdentity(id, action, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-identities'] });
      toast(`Identity ${variables.action}d successfully!`, 'success');
      setSelectedIdentity(null);
    },
    onError: (error) => {
      console.error(error);
      toast(error.response?.data?.message || 'Failed to resolve identity.', 'error');
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    );
  }

  if (identities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center border border-white/5 bg-white/[0.02] rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Shield size={32} className="text-white/40" />
        </div>
        <h3 className="text-lg font-bold text-white">All caught up!</h3>
        <p className="text-sm text-white/50 mt-1">There are no pending identity verifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {identities.map((identity) => (
          <motion.div
            key={identity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
            onClick={() => setSelectedIdentity(identity)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-white">{identity.user?.full_name || identity.user?.username}</h3>
                <span className="text-xs text-white/40">@{identity.user?.username}</span>
                {identity.status === 'VERIFIED' && identity.needs_audit ? (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest">
                    Auto-Approved (Needs Audit)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                    Pending Review
                  </span>
                )}
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                  <GraduationCap size={14} className="text-white/40" />
                  {identity.institution_name}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                  <Mail size={14} />
                  Method: {identity.method}
                </span>
              </div>
              
              {identity.identifier && (
                <p className="mt-3 text-sm text-white/60">
                  Identifier: <strong className="text-white">{identity.identifier}</strong>
                </p>
              )}
            </div>
            
            <div className="flex flex-row sm:flex-col justify-end gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resolveMutation.mutate({ id: identity.id, action: 'approve' });
                }}
                disabled={resolveMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-colors"
              >
                {identity.needs_audit ? <><CheckCircle2 size={16} /> Confirm Audit</> : <><CheckCircle2 size={16} /> Approve</>}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const reason = window.prompt("Provide a reason for rejection (e.g., 'ID is blurry' or 'Name mismatch'):");
                  if (reason === null) return;
                  resolveMutation.mutate({ id: identity.id, action: 'reject', reason });
                }}
                disabled={resolveMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/80 text-sm font-bold transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
