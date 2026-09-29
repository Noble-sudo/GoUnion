import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { PostCard } from '../components/feed/PostCard';
import { motion } from 'framer-motion';

export const InstitutionFeed = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch institution details to show the name
  const { data: institutions } = useQuery({
    queryKey: ['institutions'],
    queryFn: api.institutions.getActive,
  });
  
  const institution = institutions?.find(i => String(i.id) === String(id)) || { name: 'Campus' };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['institution-feed', id],
    queryFn: ({ pageParam = 0 }) => api.posts.getInstitutionFeed({ institutionId: id, pageParam: pageParam * 10 }),
    getNextPageParam: (lastPage, pages) => lastPage?.length === 10 ? pages.length * 10 : undefined,
  });

  // Infinite scroll observer
  const observer = React.useRef();
  const lastPostElementRef = React.useCallback(node => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-900/50 flex items-center justify-center border border-cyan-500/20">
            {institution.logoUrl ? (
              <img src={institution.logoUrl} className="w-full h-full rounded-xl object-cover" alt="" />
            ) : (
              <Building2 size={18} className="text-cyan-400" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg">{institution.name}</h1>
            <p className="text-xs text-cyan-400">Campus Feed</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4 pt-6">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
        ) : (
          data?.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.map((post, index) => {
                if (data.pages.length === i + 1 && page.length === index + 1) {
                  return <div ref={lastPostElementRef} key={post.id}><PostCard post={post} /></div>;
                }
                return <PostCard key={post.id} post={post} />;
              })}
            </React.Fragment>
          ))
        )}

        {isFetchingNextPage && (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-cyan-500" /></div>
        )}

        {!hasNextPage && data?.pages[0]?.length > 0 && (
          <div className="text-center py-12 text-white/40 text-sm">
            You've reached the end of this campus feed.
          </div>
        )}

        {data?.pages[0]?.length === 0 && (
          <div className="text-center py-20 text-white/50">
            No posts from this campus yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionFeed;
