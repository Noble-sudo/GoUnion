import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, Shield, Globe, Lock, Share2, Calendar, Edit, X, Check, Search, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, getFullUrl } from "../services/api";
import { useAuthStore } from "../store";
import { PostCard } from "../components/feed/PostCard";
import { CreatePost } from "../components/feed/CreatePost";
import { EditGroupModal } from "../components/groups/EditGroupModal";
import { EventsTab } from "../components/groups/EventsTab";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmProvider";


const JoinRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a0a0c] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">Join Request</h2>
          <button onClick={onClose} className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-white/50 mb-4">Please introduce yourself and explain why you'd like to join this circle.</p>
        <textarea
          value={message} onChange={e => setMessage(e.target.value)}
          placeholder="I'm interested in..."
          className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[var(--rc-go)] mb-6"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={() => onSubmit(message)} className="px-5 py-2.5 rounded-xl bg-[var(--rc-go)] text-black text-sm font-bold hover:bg-[#b0eb38] transition-colors">Submit Request</button>
        </div>
      </motion.div>
    </div>
  );
};

const AddMemberWidget = ({ groupId, currentMembers, onAdded }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['circle-user-search', debouncedQuery],
    queryFn: () => api.search.users(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const addMutation = useMutation({
    mutationFn: (userId) => api.groups.addMember(groupId, userId),
    onSuccess: (data) => {
      if (data.status === 'already_member') {
        toast.show("User is already a member", "warning");
      } else {
        toast.show("Member added successfully", "success");
        setQuery("");
        onAdded();
      }
    },
    onError: () => toast.show("Failed to add member", "error")
  });

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or @username..."
          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--rc-go)]/50 transition-colors"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {query.length > 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 max-h-64 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-sm text-white/50">Searching...</div>
            ) : searchResults?.length > 0 ? (
              <div className="divide-y divide-white/5">
                {searchResults.map(user => {
                  const isAlreadyMember = currentMembers.some(m => String(m.user_id) === String(user.id || user._id));
                  return (
                    <div key={user.id || user._id} className="p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar ? getFullUrl(user.avatar) : `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                          <p className="text-xs text-white/40">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addMutation.mutate(user.id || user._id)}
                        disabled={isAlreadyMember || addMutation.isPending}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isAlreadyMember 
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-[var(--rc-go)] text-black hover:bg-[#b0eb38]'
                        }`}
                      >
                        {isAlreadyMember ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-white/50">No users found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { toast } = useToast();
    const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const { data: group, isLoading: isGroupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => api.groups.getById(id),
    enabled: !!id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["group-members", id],
    queryFn: () => api.groups.getMembers(id),
    enabled: !!id,
  });

  const isMember = Boolean(group?.is_joined) || members.some((m) => String(m.user_id) === String(user?.id));
  const isOriginalAdmin = String(group?.creatorId) === String(user?.id);
  const isAdmin = isOriginalAdmin || members.some((m) => String(m.user_id) === String(user?.id) && m.role === 'admin');

  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ["group-posts", id],
    queryFn: () => api.groups.getPosts(id),
    enabled: !!id && (group?.privacy !== "private" || isMember || isAdmin),
    staleTime: 4000,
  });

  
  const { data: requests = [] } = useQuery({
    queryKey: ["group-requests", id],
    queryFn: () => api.groups.getRequests(id),
    enabled: !!id && isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: ({ requestId, status }) => api.groups.approveRequest(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast("Request processed", "success");
    }
  });

  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

  const joinMutation = useMutation({
    mutationFn: (msg = "") => api.groups.join(id, { message: msg }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast("Joined successfully", "success");
    },
  });

  
  const removeMemberMutation = useMutation({
    mutationFn: (userId) => api.groups.leave(id, userId), // reusing the leave endpoint which accepts userId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast("Member removed successfully", "success");
    },
    onError: () => toast("Failed to remove member", "error")
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.groups.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast("Left community", "success");
    },
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: group?.name || "Circle",
        text: `Join ${group?.name} on Reconnected!`,
        url: window.location.href,
      });
    } catch (e) {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard", "success");
    }
  };

  const TABS = ["posts", "people", "events", "about", ...(isAdmin && group?.privacy === "private" ? ["requests"] : [])];

  if (isGroupLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center flex-col">
        <p className="text-white/50">Circle not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-400">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] pb-24 text-white">
      {/* Cover Area */}
      <div className="relative h-48 md:h-64 w-full bg-blue-500/10">
        {(group.cover_image || group.imageUrl) && (
          <img src={group.cover_image || group.imageUrl} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/50 to-transparent" />
        
        <button onClick={() => navigate(-1)} className="absolute left-4 top-4 md:left-8 md:top-8 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-5 sm:px-8 -mt-16 relative z-10">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-md">
                {group.privacy === 'private' ? <Lock size={12} /> : <Globe size={12} />}
                {group.privacy}
              </span>
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-md">
                <Users size={12} /> {group.member_count || group.members_count || members.length} members
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">{group.name}</h1>
            <p className="mt-1 text-white/40 text-sm">{group.university || user?.university}</p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button onClick={() => setIsEditModalOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10" title="Edit Circle">
                <Edit size={20} />
              </button>
            )}
            <button onClick={handleShare} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10">
              <Share2 size={20} />
            </button>
            {isMember ? (
              <button onClick={() => leaveMutation.mutate()} className="h-12 rounded-2xl border border-white/10 bg-white/5 px-6 font-bold text-white transition-colors hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30">
                Joined
              </button>
            ) : group?.has_requested ? (
              <button disabled className="h-12 rounded-2xl border border-white/10 bg-white/5 px-6 font-bold text-white/50 cursor-not-allowed">
                Requested
              </button>
            ) : (
              <button onClick={() => group?.privacy === 'private' ? setIsJoinModalOpen(true) : joinMutation.mutate()} className="h-12 rounded-2xl bg-[var(--rc-go)] px-8 font-bold text-black transition-colors hover:bg-[#b0eb38]">
                Join Circle
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-px mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="circleDetailTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-12">
          


            {/* POSTS TAB */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              {isMember && (
                <div className="mb-8">
                  <CreatePost groupId={group.id} />
                </div>
              )}

              {isPostsLoading ? (
                <div className="text-center text-white/30 py-12">Loading posts...</div>
              ) : sortedPosts.length > 0 ? (
                sortedPosts.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-24 text-center">
                  <p className="text-white/40 text-sm">No posts yet. Be the first to start a conversation!</p>
                </div>
              )}
            </div>
          )}

          {/* PEOPLE TAB */}
          {activeTab === "people" && (
            <div className="space-y-6">
              {isAdmin && (
                <div className="rounded-3xl border border-[var(--rc-go)]/20 bg-[var(--rc-go)]/5 p-4 sm:p-6">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[var(--rc-go)]" /> Add New Member
                  </h3>
                  <p className="text-sm text-white/50 mb-4">Search for users by username or name to add them to this circle.</p>
                  
                  <AddMemberWidget groupId={id} currentMembers={members} onAdded={() => queryClient.invalidateQueries({ queryKey: ["group-members", id] })} />
                </div>
              )}
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...members].sort((a, b) => {
                  const roleScore = { admin: 3, moderator: 2, member: 1 };
                  const scoreA = roleScore[a.role] || 0;
                  const scoreB = roleScore[b.role] || 0;
                  return scoreB - scoreA;
                }).map(member => (
                <div key={member.user_id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                  <Link to={`/profile/${member.user?.username}`} className="flex-1 flex items-center gap-3 min-w-0">
                    <img src={member.user?.profile?.profile_picture ? getFullUrl(member.user.profile.profile_picture) : `https://ui-avatars.com/api/?name=${member.user?.username || 'user'}&background=random`} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-bold text-sm text-white">{member.user?.profile?.full_name || member.user?.username}</p>
                      <p className="truncate text-xs text-white/40 capitalize">{member.role || 'Member'}</p>
                    </div>
                  </Link>
                  {isAdmin && member.user_id !== user?.id && (
                    <button 
                      onClick={() => {
                        confirm({ title: 'Remove Member', message: 'Are you sure you want to remove this member from the circle?', isDanger: true, confirmText: 'Remove' }).then(yes => { if (yes) removeMemberMutation.mutate(member.user_id); })
                      }}
                      disabled={removeMemberMutation.isPending}
                      className="shrink-0 h-8 w-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Remove Member"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <EventsTab groupId={group.id} isAdmin={isAdmin} />
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-white mb-4">About this Circle</h3>
              <p className="text-white/70 leading-relaxed text-sm whitespace-pre-wrap">
                {group.description || "A community for students."}
              </p>
              
              <div className="mt-8 pt-8 border-t border-white/5 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Created</p>
                  <p className="text-sm text-white">{new Date(group.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Campus</p>
                  <p className="text-sm text-white">{group.university || user?.university}</p>
                </div>
              </div>
            </div>
          )}


          {/* REQUESTS TAB */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-24 text-center">
                  <p className="text-white/40 text-sm">No pending requests.</p>
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-4">
                      <img src={req.user?.profile?.profile_picture ? getFullUrl(req.user.profile.profile_picture) : `https://ui-avatars.com/api/?name=${req.user?.username || 'user'}&background=random`} alt="" className="h-12 w-12 rounded-full object-cover border border-white/10" />
                      <div>
                        <p className="font-bold text-white">{req.user?.profile?.full_name || req.user?.username}</p>
                        <p className="text-sm text-white/40 italic mt-1">"{req.message || "No message provided."}"</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveMutation.mutate({ requestId: req.id, status: 'rejected' })} className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"><X size={18} /></button>
                      <button onClick={() => approveMutation.mutate({ requestId: req.id, status: 'accepted' })} className="h-10 w-10 rounded-xl bg-[var(--rc-go)]/10 text-[var(--rc-go)] flex items-center justify-center hover:bg-[var(--rc-go)]/20 transition-colors"><Check size={18} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
      {isEditModalOpen && <EditGroupModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} group={group} />}
      <AnimatePresence>{isJoinModalOpen && <JoinRequestModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onSubmit={(msg) => { setIsJoinModalOpen(false); joinMutation.mutate(msg); }} />}</AnimatePresence>
    </div>
  );
};
