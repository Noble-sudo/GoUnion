import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Compass, Users, Globe, Building2, ChevronRight, UserPlus, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export const Konnect = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true);
      api.search.global(searchQuery)
        .then(res => setUsers(res.users || []))
        .finally(() => setIsSearching(false));
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const { data: campuses = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: api.institutions.getAll,
    staleTime: 600000,
  });

  const { data: globalCommunities = [] } = useQuery({
    queryKey: ['global-communities'],
    queryFn: api.groups.getGlobal,
    staleTime: 60000,
  });

  // Limit to 4 random or top campuses for the explore section
  const displayCampuses = campuses.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#030303] pb-24 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0f172a]/50 to-transparent pt-12 pb-8">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="px-5 sm:px-8 relative z-10 max-w-4xl mx-auto">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">
            <Globe className="h-3 w-3 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Konnect Network</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">Beyond your campus.</h1>
          <p className="text-white/50 max-w-lg text-sm sm:text-base leading-relaxed">
            Discover students, communities, and conversations across the Reconnected ecosystem.
          </p>
          
          <div className="mt-8 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people across all campuses..." 
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10"
            />
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-8 max-w-4xl mx-auto mt-10 space-y-12">
        
        {/* Search Results */}
        {searchQuery.trim().length > 2 && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white/40">Search Results</h2>
            {isSearching ? (
              <div className="h-32 flex items-center justify-center text-white/30 text-sm">Searching...</div>
            ) : users.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {users.map(u => (
                  <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
                    <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.fullName}&background=random`} alt="" className="h-12 w-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-bold text-sm text-white">{u.fullName}</p>
                      <p className="truncate text-xs text-white/40">@{u.username}</p>
                      <p className="truncate text-[11px] font-medium text-blue-400 mt-1">{u.university || 'Reconnected'}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-white/30 text-sm border border-white/5 rounded-2xl bg-white/[0.01]">No students found matching your search.</div>
            )}
          </motion.section>
        )}

        {/* Explore Campuses */}
        {!searchQuery && displayCampuses.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Explore Campuses</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayCampuses.map((campus) => {
                const acronym = campus.name.match(/\b([A-Z])/g)?.join('') || "UN";
                return (
                  <div key={campus.id} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] hover:border-white/10 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/60">{acronym}</span>
                    </div>
                    <h3 className="font-bold text-white mb-1 truncate">{campus.name}</h3>
                    <p className="text-xs text-white/40 truncate">{campus.location || "Nigeria"}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Communities */}
        {!searchQuery && globalCommunities.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white/40">Cross-Campus Communities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {globalCommunities.map((community) => (
                <Link key={community.id} to={`/groups/${community.id}`} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04] cursor-pointer">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg">
                    {community.cover_image ? (
                      <img src={community.cover_image} alt="" className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      <Users className="h-5 w-5 text-white/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-white">{community.name}</h3>
                    <p className="text-[11px] text-white/40">{community.members_count || 0} members</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
