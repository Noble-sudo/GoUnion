import React, { useEffect, useRef } from "react";
import { Music, Play, Pause } from "lucide-react";
import { parseTrack, playTrack, pauseTrack, useTrackPlayer } from "../../utils/audius";

// Shows the song attached to a post and plays it while the post is on screen.
export const PostMusic = ({ content, cardRef }) => {
  const track = parseTrack(content);
  const id = track ? track.id : null;
  const { playing, toggle } = useTrackPlayer(id, track ? track.url : "");
  const userPaused = useRef(false);

  // Video sound would clash with the song, so mute the post's video while the song plays.
  useEffect(() => {
    const card = cardRef && cardRef.current;
    if (!card || !playing) return undefined;
    const vids = Array.prototype.slice.call(card.querySelectorAll("video"));
    const before = vids.map((v) => v.muted);
    vids.forEach((v) => { v.muted = true; });
    return () => { vids.forEach((v, i) => { v.muted = before[i]; }); };
  }, [playing, cardRef]);

  // Start when mostly visible, stop when scrolled away.
  useEffect(() => {
    const el = cardRef && cardRef.current;
    if (!id || !el) return undefined;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          if (!userPaused.current) playTrack(id, track.url);
        } else {
          pauseTrack(id);
        }
      });
    }, { threshold: [0, 0.6, 1] });
    obs.observe(el);
    return () => { obs.disconnect(); pauseTrack(id); };
  }, [id, cardRef]);

  if (!track) return null;
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); userPaused.current = playing; toggle(); }}
      className="mt-2 flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 text-left active:scale-95"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-black">{playing ? <Pause size={13} /> : <Play size={13} />}</span>
      <Music size={12} className="shrink-0 text-primary" />
      <span className="truncate text-xs font-bold text-white/80">{track.title} - {track.artist}</span>
    </button>
  );
};
