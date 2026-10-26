import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard } from "../components/feed/PostCard";
import { StatusCircles } from "../components/feed/StatusCircles";
import { CreatePost } from "../components/feed/CreatePost";
import { api } from "../services/api";
import { FollowBackUrge } from "../components/feed/FollowBackUrge";
import { useAuthStore } from "../store";
import { MapPin, Users, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeTour } from "../components/onboarding/WelcomeTour";

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const loadMoreRef = useRef(null);
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("for_you");

  const refreshFeed = async () => {
    await queryClient.invalidateQueries({ queryKey: ["feed"] });
  };

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["feed"] });
  }, [queryClient]);

  useEffect(() => {
    const handleExternalRefresh = () => {
      void refreshFeed();
    };
    window.addEventListener("gounion-refresh-feed", handleExternalRefresh);
    return () => window.removeEventListener("gounion-refresh-feed", handleExternalRefresh);
  }, []);

  // Back button on Pulse: scrolled down -> back goes to the top and refreshes; at the top -> back leaves.
  useEffect(() => {
    const flagged = () => !!((window.history.state || {}).__pulseGuard);
    const prevRestore = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    let guardOn = flagged();
    let ticking = false;
    const scrollY = () => window.scrollY || document.documentElement.scrollTop || 0;
    const check = () => {
      ticking = false;
      const s = window.history.state || {};
      if (s.__overlay) return;
      const y = scrollY();
      if (y > 400 && !guardOn && !s.__pulseGuard) {
        window.history.pushState(Object.assign({}, s, { __pulseGuard: true }), "");
        guardOn = true;
      } else if (y < 60 && guardOn && s.__pulseGuard) {
        guardOn = false;
        window.history.back();
      }
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; window.requestAnimationFrame(check); }
    };
    const onPop = () => {
      const s = window.history.state || {};
      if (s.__pulseGuard || s.__overlay) return;
      if (guardOn && window.location.pathname === "/") {
        guardOn = false;
        if (scrollY() < 60) {
          window.history.back();
        } else {
          window.scrollTo(0, 0);
          window.requestAnimationFrame(() => window.scrollTo(0, 0));
          queryClient.resetQueries({ queryKey: ["feed"] });
        }
      }
    };
    // Browsers only keep an extra back step if it was added during a real tap, so also arm it on taps.
    const onTap = () => {
      const s = window.history.state || {};
      if (s.__overlay || guardOn || s.__pulseGuard) return;
      if (scrollY() > 400) {
        window.history.pushState(Object.assign({}, s, { __pulseGuard: true }), "");
        guardOn = true;
      }
    };
    window.addEventListener("pointerup", onTap, true);
    window.addEventListener("click", onTap, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    const t = setTimeout(check, 400);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerup", onTap, true);
      window.removeEventListener("click", onTap, true);
      window.removeEventListener("popstate", onPop);
      window.history.scrollRestoration = prevRestore;
    };
  }, [queryClient]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => api.posts.getFeed({ pageParam, type: 'media' }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => lastPage.length > 0 ? allPages.length : undefined,
  });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { threshold: 0.1, rootMargin: "100px" });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  let posts = Array.from(new Map((data?.pages.flat() || []).map((post) => [post.id, post])).values());
  
  if (activeTab === "following") {
    posts = posts.filter(p => Boolean(p.author?.isFollowing) || Boolean(p.author?.is_following));
  } else if (activeTab === "trending") {
    posts = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  const TABS = [
    { id: "for_you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "trending", label: "Trending" }
  ];

  const nameString = user?.fullName || user?.full_name || user?.name || user?.username || "Student";
  const firstName = nameString.split(" ")[0];
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const messages = [
    timeGreeting,
    "Ready to connect",
    "What's on your mind",
    "Stay inspired",
    "Welcome back"
  ];
  // Stable random per session/render
  const [greeting] = React.useState(() => messages[Math.floor(Math.random() * messages.length)]);

  const universityName = user?.university || user?.institution?.name || "Campus";

  return (
    <div className="w-full px-0 pb-24 pt-0">
      <WelcomeTour />
      
      

      <div className="max-w-2xl mx-auto w-full">
        
        {user?.verification_status === 'PENDING' && (
          <div className="mx-5 sm:mx-0 mb-6 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-blue-400 font-bold text-lg mb-1">Identity Under Review</h3>
              <p className="text-blue-400/80 text-sm leading-relaxed">
                Your campus network is temporarily locked. An admin is currently reviewing your identity documentation. Once approved, your campus feed, groups, and network will automatically unlock!
              </p>
            </div>
          </div>
        )}
        <FollowBackUrge className="mt-4 block lg:hidden mx-5" />

        {/* Tab System */}
        <div className="px-5 sm:px-0 mb-3 mt-2 md:mt-4">
          <div className="flex items-center justify-between sm:justify-start sm:gap-1 border-b border-white/10 pb-px">
            {TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none relative px-2 sm:px-4 py-3 text-sm font-bold transition-colors text-center ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="feedTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        

        <StatusCircles />
        <div className="px-5 sm:px-0 mb-3">
          <CreatePost mediaOnly />
        </div>

        <div className="w-full sm:px-0 mt-2">
          {status === "pending" ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((key) => (
                <div key={key} className="glass-panel animate-pulse rounded-2xl border border-white/5 p-4 md:p-5 bg-white/[0.02]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="mb-2 h-3 w-32 rounded-md bg-white/10" />
                      <div className="h-2 w-20 rounded-md bg-white/5" />
                    </div>
                  </div>
                  <div className="mb-4 space-y-3">
                    <div className="h-2 w-full rounded-md bg-white/10" />
                    <div className="h-2 w-5/6 rounded-md bg-white/10" />
                  </div>
                  <div className="h-48 w-full rounded-xl bg-white/5" />
                </div>
              ))}
            </div>
          ) : status === "error" ? (
            <div className="rounded-2xl border border-white/5 p-8 text-center bg-white/[0.02] text-white/50">
              Unable to load Campus Feed. Please try again later.
              <br />
              <span className="mt-2 block text-xs text-red-400">{error?.message || String(error)}</span>
            </div>
          ) : (
            <div>
              {posts.length === 0 ? (
                activeTab === "following" ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                    <p className="rc-label">Your network is quiet</p>
                    <h2 className="mt-3 text-2xl font-black text-white">No posts from your connections</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/42">
                      When people you follow share posts or videos, they'll appear here. Connect with more students or check the 'For You' tab to discover what's happening on campus.
                    </p>
                  </div>
                ) : activeTab === "trending" ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                    <p className="rc-label">Nothing trending yet</p>
                    <h2 className="mt-3 text-2xl font-black text-white">Campus is warming up</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/42">
                      The most liked and discussed posts will bubble up here. Start engaging with posts to help them trend!
                    </p>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                    <p className="rc-label">Campus Pulse is quiet</p>
                    <h2 className="mt-3 text-2xl font-black text-white">Be the first to drop something.</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/42">
                      Share a photo or video from around campus. Thoughts and writeups live in Takes.
                    </p>
                  </div>
                )
              ) : (
                posts.map((post) => <PostCard post={post} key={post.id} />)
              )}
              <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-12">
                {isFetchingNextPage || hasNextPage ? (
                  <div className="h-4 w-full" />
                ) : (
                  <p className="text-sm font-medium text-white/30">You are caught up on Campus.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
