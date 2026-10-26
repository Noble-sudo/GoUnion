import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { PostCard } from "../components/feed/PostCard";
import { api } from "../services/api";
import { useAuthStore } from "../store";
import { useToast } from "../components/ui/Toast";

const MAX_LENGTH = 2000;

export const Takes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const loadMoreRef = useRef(null);
  const [text, setText] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["feed", "takes"],
    queryFn: ({ pageParam }) => api.posts.getFeed({ pageParam, type: "text" }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.length > 0 ? allPages.length : undefined),
  });

  const postTake = useMutation({
    mutationFn: (caption) => api.posts.createFeedPost({ caption, image: null }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["feed", "takes"] });
      toast("Your take is live", "success");
    },
    onError: () => toast("Could not post your take. Please try again.", "error"),
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    const node = loadMoreRef.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = Array.from(new Map((data?.pages.flat() || []).map((post) => [post.id, post])).values());
  const trimmed = text.trim();
  const canPost = trimmed.length > 0 && !postTake.isPending;
  const submit = () => {
    if (canPost) postTake.mutate(trimmed);
  };
  const avatar =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || "K")}&background=random`;

  return (
    <div className="max-w-2xl mx-auto w-full pb-24">
      <div className="px-5 sm:px-0 pt-6 pb-4">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">Takes</h1>
        <p className="mt-1 text-sm text-white/45">Thoughts, questions and writeups from the community.</p>
      </div>

      <div className="mx-5 sm:mx-0 mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex gap-3">
          <img
            src={avatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
              }}
              placeholder="What's your take?"
              rows={3}
              className="w-full resize-none border-none bg-transparent text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-0"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-white/30">
                {text.length}/{MAX_LENGTH}
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={!canPost}
                className="rounded-full bg-primary px-5 py-1.5 text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {postTake.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        {status === "pending" ? (
          <div className="space-y-6">
            {[1, 2, 3].map((key) => (
              <div key={key} className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10" />
                  <div className="h-3 w-32 rounded-md bg-white/10" />
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full rounded-md bg-white/10" />
                  <div className="h-2 w-5/6 rounded-md bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : status === "error" ? (
          <div className="mx-5 sm:mx-0 rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-white/50">
            Unable to load Takes right now. Please try again later.
          </div>
        ) : posts.length === 0 ? (
          <div className="mx-5 sm:mx-0 rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-16 text-center">
            <PenLine className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-black text-white">No takes yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/45">
              Be the first. Ask a question, share an opinion, or write something people should read.
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard post={post} key={post.id} />)
        )}
        <div ref={loadMoreRef} className="h-8 w-full" />
      </div>
    </div>
  );
};