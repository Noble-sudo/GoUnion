import React, { useRef, useState } from "react";
import { useToast } from "../components/ui/Toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Users as UsersIcon, Plus, Globe, Lock, X, Image as ImageIcon, Sparkles, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useAuthStore } from "../store";

export const Groups = () => {
  const queryClient = useQueryClient();
  const coverInputRef = useRef(null);
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my_circles");
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    privacy: "public",
    category: "Academic",
    image: null,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: api.groups.getAll,
  });

  const createGroupMutation = useMutation({
    mutationFn: api.groups.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsModalOpen(false);
      setNewGroup({ name: "", description: "", privacy: "public", category: "Academic", image: null });
      setActiveTab("my_circles");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error creating circle: " + err.message);
    },
  });

  const filteredGroups = groups.filter((group) =>
    `${group.name} ${group.description}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myCircles = filteredGroups.filter(g => g.isJoined);
  const discoverCircles = filteredGroups.filter(g => !g.isJoined && (!selectedCategory || g.category === selectedCategory || (selectedCategory === "Other" && !CATEGORIES.includes(g.category))));

  const CATEGORIES = ["Academic", "Sports", "Gaming", "Technology", "Entertainment", "Student Life"];

  return (
    <div className="mx-auto w-full max-w-6xl pb-24 pt-4 md:pt-8 px-5 sm:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
        <div>
          <h1 className="font-serif text-4xl text-white md:text-5xl font-bold tracking-tight">Your Circles</h1>
          <p className="mt-3 text-sm leading-6 text-white/50 max-w-md">
            Communities built around shared interests, identity, academic context or activities at {user?.university || "your campus"}.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-black transition hover:bg-white/90 active:scale-95 shrink-0">
          <Plus size={18} /> Create Circle
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="mb-8">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/10"
          />
        </div>

        {!searchQuery && (
          <div className="flex items-center gap-2 border-b border-white/10 pb-px">
            <button 
              onClick={() => setActiveTab("my_circles")}
              className={`relative px-4 py-3 text-sm font-bold transition-colors ${activeTab === "my_circles" ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              My Circles
              {activeTab === "my_circles" && (
                <motion.div layoutId="circleTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab("discover")}
              className={`relative px-4 py-3 text-sm font-bold transition-colors ${activeTab === "discover" ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              Discover
              {activeTab === "discover" && (
                <motion.div layoutId="circleTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        
        {/* If searching, just show filtered */}
        {searchQuery ? (
          filteredGroups.length > 0 ? (
            filteredGroups.map(group => <CircleCard key={group.id} group={group} user={user} />)
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/[0.025] py-24 text-center">
              <Sparkles className="mx-auto mb-4 text-white/25" size={28} />
              <p className="text-white/45 text-sm">No Circles found for "{searchQuery}".</p>
            </div>
          )
        ) : (
          /* Normal Tabs */
          activeTab === "my_circles" ? (
            myCircles.length > 0 ? (
              myCircles.map(group => <CircleCard key={group.id} group={group} user={user} />)
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/[0.025] py-24 text-center">
                <UsersIcon className="mx-auto mb-4 text-white/25" size={28} />
                <h3 className="font-bold text-white text-lg mb-2">No Circles yet.</h3>
                <p className="text-white/45 text-sm mb-6 max-w-sm mx-auto">Find communities around your campus and interests.</p>
                <button onClick={() => setActiveTab("discover")} className="inline-flex h-10 items-center justify-center rounded-xl bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20">
                  Explore Circles
                </button>
              </div>
            )
          ) : (
            /* Discover Tab */
            <>
              <div className="col-span-full mb-2">
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setSelectedCategory(selectedCategory === c ? null : c)} className={`whitespace-nowrap px-4 py-2 rounded-xl border text-xs font-bold transition-colors ${selectedCategory === c ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {discoverCircles.length > 0 ? (
                discoverCircles.map(group => <CircleCard key={group.id} group={group} user={user} />)
              ) : (
                <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/[0.025] py-24 text-center">
                  <p className="text-white/45 text-sm">No new public Circles found to discover.</p>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] bg-[#111113] border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 p-6">
                <div>
                  <h2 className="font-serif text-2xl text-white font-bold">Create a Circle</h2>
                  <p className="mt-1 text-xs text-white/40">Start a focused community.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/40 bg-white/5 rounded-full transition-colors hover:text-white hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Circle Name</label>
                  <input type="text" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="e.g. Computer Science 200L" className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-white/20 focus:bg-white/10" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Privacy</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "public", label: "Public", icon: Globe, desc: "Anyone can join" },
                      { id: "private", label: "Private", icon: Lock, desc: "Invite only" },
                    ].map((privacy) => (
                      <button key={privacy.id} onClick={() => setNewGroup({ ...newGroup, privacy: privacy.id })} className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${newGroup.privacy === privacy.id ? "border-blue-500/30 bg-blue-500/10 text-white" : "border-white/5 bg-white/5 text-white/40 hover:bg-white/[0.07]"}`}>
                        <privacy.icon size={20} className={newGroup.privacy === privacy.id ? "text-blue-400" : ""} />
                        <div className="text-left min-w-0">
                          <p className="text-sm font-bold truncate">{privacy.label}</p>
                          <p className="text-[10px] opacity-60 truncate">{privacy.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Category</label>
                  <select 
                    value={newGroup.category} 
                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })} 
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-white/20 focus:bg-white/10 appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111113]">{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>
                  <textarea value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} placeholder="What is this community about?" className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-relaxed text-white outline-none transition focus:border-white/20 focus:bg-white/10" />
                </div>

                <div onClick={() => coverInputRef.current?.click()} className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 transition-all hover:bg-white/[0.07]">
                  <div className="rounded-xl bg-white/5 p-3 text-white/40">
                    <ImageIcon size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Cover Image</p>
                    <p className="text-xs text-white/40">{newGroup.image ? newGroup.image.name : "Recommended: 1200x600px"}</p>
                  </div>
                  <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => setNewGroup({ ...newGroup, image: e.target.files?.[0] || null })} />
                </div>
              </div>

              <div className="shrink-0 border-t border-white/5 bg-white/5 p-4 sm:p-6">
                <button onClick={() => createGroupMutation.mutate(newGroup)} disabled={!newGroup.name || createGroupMutation.isPending} className="w-full rounded-2xl bg-white py-4 font-black text-black transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50">
                  {createGroupMutation.isPending ? "Creating..." : "Create Circle"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CircleCard = ({ group, user }) => {
  const campusName = group.institutionName || group.university || user?.university || "Campus";

  return (
    <Link to={`/groups/${group.id}`} className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] transition-colors hover:border-white/10 flex flex-col h-full">
      <div className="h-24 w-full bg-white/5">
        {group.imageUrl && (
          <img src={group.imageUrl} alt="" className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/50 backdrop-blur-md">
            <Building2 size={12} />
            <span>Campus</span>
          </div>
          <div className="text-[10px] font-bold text-white/40 flex items-center gap-1">
            <UsersIcon size={12} /> {group.memberCount || 0}
          </div>
        </div>
        <h3 className="font-serif text-xl font-bold text-white line-clamp-1">{group.name}</h3>
        <p className="mt-1 mb-4 flex-1 text-xs leading-relaxed text-white/40 line-clamp-2">
          {group.description || "A community for students."}
        </p>
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-white/30 truncate">{campusName}</span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${group.isJoined ? 'bg-white/10 text-white' : 'bg-blue-500/10 text-blue-400'}`}>
            {group.isJoined ? 'Joined' : 'Open'}
          </span>
        </div>
      </div>
    </Link>
  );
};
