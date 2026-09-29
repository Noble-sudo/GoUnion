import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Search, Users, Building2, Compass, X, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { PostCard } from '../components/feed/PostCard';
import { useScrollDirection } from '../hooks/useScrollDirection';

const TABS = [
  { id: 'feed', label: 'Global Feed', icon: Compass },
  { id: 'campuses', label: 'Explore Campuses', icon: Building2 },
  { id: 'communities', label: 'Communities', icon: Users },
];

export const Konnect = () => {
  const scrollDirection = useScrollDirection();
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Hide intro after 2.5 seconds
    const introTimer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search Users
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['konnect-search', debouncedQuery],
    queryFn: () => api.search.globalUsers(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  // Global Feed
  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFeedLoading,
    isError: isFeedError,
  } = useInfiniteQuery({
    queryKey: ['konnect-feed'],
    queryFn: ({ pageParam = 0 }) => api.posts.getGlobalFeed({ pageParam }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.length === 10) return pages.length * 10;
      return undefined;
    },
  });

  // Intersection Observer for Infinite Scroll
  const observerRef = useRef(null);
  const lastPostElementRef = useCallback((node) => {
    if (isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Institutions
  const { data: institutions, isLoading: isInstitutionsLoading } = useQuery({
    queryKey: ['institutions'],
    queryFn: api.institutions.getActive,
  });

  // Communities
  const { data: communities, isLoading: isCommunitiesLoading } = useQuery({
    queryKey: ['global-communities'],
    queryFn: api.groups.getGlobal,
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white relative font-sans">
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
              <Globe className="w-20 h-20 text-cyan-400 relative z-10 mx-auto mb-8" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center"
            >
              <h1 className="font-serif text-3xl font-bold tracking-widest uppercase text-white mb-2">Connecting</h1>
              <p className="text-cyan-400/80 font-mono text-sm tracking-[0.3em]">ESTABLISHING GLOBAL LINK...</p>
            </motion.div>

            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ delay: 1, duration: 1, ease: "easeInOut" }}
              className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-8"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-cyan-900/20 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pb-24">
        {/* Sticky Header */}
        <div className={`sticky top-0 z-50 bg-[#030303]/85 backdrop-blur-2xl border-b border-white/10 pt-3 md:pt-6 transition-transform duration-300 ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}`}>
          <div className="px-4 md:px-0 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mb-3">
            {/* Header Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Konnect <span className="text-cyan-400 text-[9px] bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded-md uppercase tracking-widest font-sans font-bold">Network</span>
                </h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-white/40" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all campuses..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-sm shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Tabs Navigation */}
          {!searchQuery && (
            <div className="px-2 sm:px-0">
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 sm:flex-none relative flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 text-[11px] sm:text-sm font-bold transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                      <span>{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="konnectTab"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 rounded-t-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {searchQuery.length > 2 ? (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="rc-label text-white/50 mb-4 px-1">Global Users</h3>
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : searchResults?.length > 0 ? (
                  <div className="grid gap-3">
                    {searchResults.map((user, i) => (
                      <motion.div
                        key={user.id || user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          to={`/profile/${user.username}`}
                          className="flex items-center gap-4 p-4 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white/50 bg-gradient-to-br from-cyan-900/50 to-blue-900/50">
                                {user.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{user.name}</h4>
                            <p className="text-sm text-white/50 truncate">@{user.username}</p>
                          </div>
                          {user.institutionName && (
                            <div className="hidden sm:block text-xs font-medium text-cyan-400/70 bg-cyan-400/10 px-3 py-1 rounded-full whitespace-nowrap">
                              {user.institutionName}
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Search className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No users found</h3>
                    <p className="text-white/50">Try searching with a different name or username.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`tab-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'feed' && (
                  <div className="space-y-6">
                    {isFeedLoading ? (
                      <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      </div>
                    ) : isFeedError ? (
                      <div className="p-6 rounded-3xl border border-red-500/20 bg-red-500/5 text-center">
                        <p className="text-red-400">Failed to load global feed.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {feedData?.pages.map((page, i) => (
                            <React.Fragment key={i}>
                              {page?.map((post, index) => {
                                if (feedData.pages.length === i + 1 && page.length === index + 1) {
                                  return (
                                    <div ref={lastPostElementRef} key={post.id || post._id}>
                                      <PostCard post={post} />
                                    </div>
                                  );
                                }
                                return <PostCard key={post.id || post._id} post={post} />;
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                        
                        {isFetchingNextPage && (
                          <div className="flex justify-center py-6">
                            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                          </div>
                        )}
                        
                        {!hasNextPage && feedData?.pages[0]?.length > 0 && (
                          <div className="text-center py-12 text-white/40 text-sm flex flex-col items-center gap-2">
                            <Globe className="w-6 h-6 opacity-50" />
                            <p>You've seen everything on the global network.</p>
                          </div>
                        )}

                        {feedData?.pages[0]?.length === 0 && (
                          <div className="text-center py-20 px-4">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
                              <Compass className="w-10 h-10 text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white mb-2">The network is quiet</h3>
                            <p className="text-white/50 max-w-sm mx-auto">No global posts available yet. Be the first to share something across campuses!</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'campuses' && (
                  <div className="space-y-4">
                    {isInstitutionsLoading ? (
                      <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
                    ) : institutions?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {institutions.map((inst, i) => (
                          <motion.div
                            key={inst.id || inst._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Link to={`/institutions/${inst.id || inst._id}`} className="block p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all group h-full">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-cyan-950 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                                  {inst.logoUrl ? (
                                    <img src={inst.logoUrl} alt={inst.name} className="w-full h-full object-cover rounded-xl" />
                                  ) : (
                                    <Building2 className="w-6 h-6 text-cyan-400" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">{inst.name}</h4>
                                  <p className="text-sm text-white/50 mt-1 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {inst.studentCount || 0} students
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 px-4">
                        <h3 className="text-xl font-bold text-white mb-2">No campuses found</h3>
                        <p className="text-white/50">There are currently no institutions on the network.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'communities' && (
                  <div className="space-y-4">
                    {isCommunitiesLoading ? (
                      <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
                    ) : communities?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {communities.map((comm, i) => (
                          <motion.div
                            key={comm.id || comm._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Link to={`/groups/${comm.id || comm._id}`} className="block p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all group h-full relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Globe className="w-24 h-24 text-cyan-400 -mr-6 -mt-6" />
                              </div>
                              <div className="relative z-10">
                                <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/20 mb-3 group-hover:scale-110 transition-transform">
                                  {comm.icon ? (
                                    <img src={comm.icon} alt={comm.name} className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    <Users className="w-5 h-5 text-cyan-400" />
                                  )}
                                </div>
                                <h4 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors mb-1">{comm.name}</h4>
                                <p className="text-sm text-white/50 line-clamp-2 mb-4">{comm.description}</p>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-medium text-cyan-400/80 bg-cyan-400/10 px-2 py-1 rounded-md flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Global
                                  </span>
                                  <span className="text-xs text-white/40 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {comm.memberCount || 0}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 px-4">
                        <h3 className="text-xl font-bold text-white mb-2">No global communities</h3>
                        <p className="text-white/50">Be the first to start a cross-campus circle.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Konnect;
