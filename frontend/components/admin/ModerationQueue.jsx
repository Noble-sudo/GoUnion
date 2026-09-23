import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Shield, Check, X, AlertTriangle, UserX, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ModerationQueue() {
  const [filter, setFilter] = useState('pending');
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.reports.getAll(),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status, take_down_reason }) => api.reports.resolve(id, status, take_down_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });

  const suspendMutation = useMutation({
    mutationFn: (userId) => api.admin.toggleActive(userId),
    onSuccess: () => {
      // invalidate affected users or reports as needed
    }
  });

  const handleIgnore = (id) => {
    resolveMutation.mutate({ id, status: 'dismissed' });
  };

  const handleTakeDown = (id) => {
    const reason = window.prompt("Are you sure you want to take this down? Provide a reason/warning to the creator:");
    if (reason !== null && reason.trim() !== "") {
      resolveMutation.mutate({ id, status: 'resolved', take_down_reason: reason.trim() });
    } else if (reason !== null) {
      toast.error("A reason is required to take down a post.");
    }
  };

  const handleSuspend = (userId) => {
    suspendMutation.mutate(userId);
  };

  // Filter reports based on active tab
  const filteredReports = reports.filter(r => r.status === filter);

  if (isLoading) {
    return <div className="p-8 text-center text-white/50">Loading moderation queue...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Moderation Queue
        </h2>
        
        <div className="flex space-x-2 bg-white/5 p-1 rounded-xl">
          {['pending', 'resolved', 'dismissed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === status 
                  ? 'bg-primary text-[#030303]' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/5">
            <Check className="w-12 h-12 text-primary/50 mx-auto mb-4" />
            <p className="text-white/50">No {filter} reports to review.</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={report.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rc-label text-primary">{report.reason || 'Reported Content'}</span>
                    <p className="text-white/70 text-sm mt-1">
                      Reported by <span className="text-white font-medium">{report.reporter?.username || 'Unknown User'}</span>
                    </p>
                  </div>
                  <div className="text-xs text-white/40">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>

                {report.post && (
                  <div className="bg-[#030303] rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Post Preview</span>
                      <Link to={`/post/${report.post.id}`} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                         <ExternalLink className="w-3 h-3"/> View full post
                      </Link>
                    </div>
                    <p className="text-white/80 text-sm">{report.post.content}</p>
                    {report.post.image && (
                      <div className="mt-3 flex items-center gap-2 text-primary text-sm">
                        <ImageIcon className="w-4 h-4" />
                        <span>Attached Image</span>
                      </div>
                    )}
                  </div>
                )}
                
                {report.comment && (
                  <div className="bg-[#030303] rounded-xl p-4 border border-white/5">
                    <span className="text-xs text-white/40 mb-2 block uppercase tracking-widest font-bold">Comment Preview</span>
                    <p className="text-white/80 text-sm">{report.comment.content}</p>
                  </div>
                )}
              </div>

              {filter === 'pending' && (
                <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                  <button
                    onClick={() => handleIgnore(report.id)}
                    disabled={resolveMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    Ignore
                  </button>
                  <button
                    onClick={() => handleTakeDown(report.id)}
                    disabled={resolveMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Take Down
                  </button>
                  {report.contentOwnerId && (
                    <button
                      onClick={() => handleSuspend(report.contentOwnerId)}
                      disabled={suspendMutation.isPending}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm"
                    >
                      <UserX className="w-4 h-4" />
                      Suspend User
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
