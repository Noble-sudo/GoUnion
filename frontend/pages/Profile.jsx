import React, { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Calendar, MessageSquare, Edit3, UserPlus, Check, X } from "lucide-react";
import { useAuthStore } from "../store";
import { motion, AnimatePresence } from "framer-motion";
import { EditProfileModal } from "../components/profile/EditProfileModal";
import { PostCard } from "../components/feed/PostCard";
import { CreatePost } from "../components/feed/CreatePost";
import { api } from "../services/api";
import { useToast } from "../components/ui/Toast";

export const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const isOwnProfile = currentUser?.username === username;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHoveringConnection, setIsHoveringConnection] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const coverInputRef = useRef(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => api.profiles.get(username || ""),
    enabled: !!username,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["profile-posts", username],
    queryFn: () => api.profiles.getPosts(username || ""),
    enabled: !!username,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["profile-followers", user?.id],
    queryFn: () => api.profiles.getFollowers(user?.id || ""),
    enabled: !!user?.id,
  });

  const isFollowingProfile = followers.some(f => String(f.id) === String(currentUser?.id)) || Boolean(user?.is_following) || Boolean(user?.isFollowing);

  const toggleFollowMutation = useMutation({
    mutationFn: (action) => action === "unfollow" ? api.profiles.unfollow(user.id) : api.profiles.follow(user.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["profile", username] });
      await queryClient.cancelQueries({ queryKey: ["profile-followers", user?.id] });
      const prevProfile = queryClient.getQueryData(["profile", username]);
      
      queryClient.setQueryData(["profile", username], old => {
        if (!old) return old;
        return { ...old, isFollowing: !isFollowingProfile, is_following: !isFollowingProfile };
      });
      
      if (!isFollowingProfile && currentUser) {
         queryClient.setQueryData(["profile-followers", user?.id], old => {
           if (!old) return [currentUser];
           return [...old, currentUser];
         });
      } else if (currentUser) {
         queryClient.setQueryData(["profile-followers", user?.id], old => {
           if (!old) return [];
           return old.filter(f => String(f.id) !== String(currentUser.id));
         });
      }
      return { prevProfile };
    },
    onError: (err, variables, context) => {
      if (context?.prevProfile) {
        queryClient.setQueryData(["profile", username], context.prevProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["profile-followers", user?.id] });
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: (file) => api.profiles.update({ coverImage: file }),
    onSuccess: (data) => {
      if (isOwnProfile) {
        updateUser({ ...currentUser, coverUrl: data.coverUrl });
      }
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      toast("Cover image updated", "success");
    },
  });

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateCoverMutation.mutate(file);
    }
  };

  const TABS = ["posts", "connections", "about"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center flex-col">
        <p className="text-white/50">Student not found.</p>
        <Link to="/" className="mt-4 text-blue-400">Return to Campus</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] pb-24 text-white overflow-x-hidden">
      
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 w-full bg-blue-500/10 group">
        {user.coverUrl && (
          <img src={user.coverUrl} alt="Cover" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent" />
        
        {isOwnProfile && (
          <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
            <input type="file" ref={coverInputRef} onChange={handleCoverUpload} className="hidden" accept="image/*" />
            <button onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 rounded-xl bg-black/50 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-black/70">
              <Edit3 size={16} /> Edit Cover
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        
        {/* Profile Header */}
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative">
                <img 
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} 
                  alt={user.fullName} 
                  className="h-32 w-32 rounded-3xl border-4 border-[#030303] bg-[#111113] object-cover shadow-2xl" 
                />
              </div>
              
              <div className="pb-2">
                <div className="flex items-center gap-2">
    <h1 className="font-serif text-3xl font-bold text-white">{user.fullName}</h1>
    {user.verification_status === 'VERIFIED' && (
      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 border border-primary/40 text-primary shadow-[0_0_15px_rgba(196,255,14,0.25)]" title="Verified Student">
        <Check size={14} strokeWidth={3} />
      </span>
    )}
    {user.verification_status === 'LEGACY_UNVERIFIED' && (
      <span className="flex items-center justify-center px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-[10px] font-bold text-yellow-500 uppercase tracking-wider" title="Legacy User (Unverified)">
        Legacy
      </span>
    )}
  </div>
                <p className="text-white/40 text-sm mt-1">@{user.username}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  
                  {user.major && <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">{user.major}</span>}
                  {user.level && <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">{user.level} Level</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pb-2">
              {isOwnProfile ? null : (
                <>
                  <Link to={`/messages?user=${user.id}&name=${encodeURIComponent(user.fullName || user.username)}&avatar=${encodeURIComponent(user.avatarUrl)}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
                    <MessageSquare size={18} />
                  </Link>
                  <button 
                    onClick={() => { if (isFollowingProfile) { setShowDisconnectConfirm(true); } else { toggleFollowMutation.mutate("follow"); } }}
                    disabled={toggleFollowMutation.isPending} 
                    onMouseEnter={() => setIsHoveringConnection(true)}
                    onMouseLeave={() => setIsHoveringConnection(false)}
                    className={`flex h-10 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-colors ${isFollowingProfile ? 'border border-white/10 bg-white/5 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-white text-black hover:bg-white/90'}`}>
                    {isFollowingProfile ? (
                      isHoveringConnection ? <>Disconnect</> : <>Connected</>
                    ) : (
                      <><UserPlus size={16} /> Connect</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

                {/* Stats */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">{user.followers || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Connections</span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">{user.totalLikes || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Likes</span>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-8 max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Bio</p>
          <div className="text-sm leading-relaxed text-white/70">
            {user.bio || (isOwnProfile ? "Write something about yourself in your settings." : "No bio provided yet.")}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-px mb-8">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-bold capitalize transition-colors ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-12 max-w-2xl">
          
          {/* POSTS */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              {isOwnProfile && <CreatePost profileUsername={user.username} />}
              
              {postsLoading ? (
                <div className="text-center text-white/30 py-12">Loading posts...</div>
              ) : posts?.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                  <p className="text-white/40 text-sm">No posts yet.</p>
                </div>
              )}
            </div>
          )}

          {/* CONNECTIONS */}
          {activeTab === "connections" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {followers.map(f => (
                <Link key={f.id} to={`/profile/${f.username}`} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
                  <img src={f.avatarUrl || `https://ui-avatars.com/api/?name=${f.fullName}&background=random`} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-bold text-sm text-white">{f.fullName}</p>
                    <p className="truncate text-xs text-white/40">@{f.username}</p>
                  </div>
                </Link>
              ))}
              {followers.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/40 text-sm">No connections yet.</div>
              )}
            </div>
          )}

          {/* ABOUT */}
          {activeTab === "about" && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Campus Details</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <MapPin size={16} className="text-blue-400" /> {user.university || "Not specified"}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Calendar size={16} className="text-green-400" /> Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
      {isEditModalOpen && <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onUpdate={(updated) => updateUser({ ...currentUser, ...updated })} />}
      
      <AnimatePresence>
        {showDisconnectConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm rounded-3xl bg-[#111113] border border-white/10 p-6 shadow-2xl">
              <h3 className="text-lg font-black text-white mb-2">Disconnect</h3>
              <p className="text-sm text-zinc-400 mb-6">Are you sure you want to disconnect from @{user?.username}? You won't see their posts in your following feed.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDisconnectConfirm(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={() => { setShowDisconnectConfirm(false); toggleFollowMutation.mutate("unfollow"); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors">Disconnect</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
