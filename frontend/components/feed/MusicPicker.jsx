import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Search, Play, Pause, Music } from "lucide-react";
import { audiusReady, searchTracks, trendingTracks, popularTracks, useTrackPlayer, pauseTrack } from "../../utils/audius";

const Row = ({ track, onPick }) => {
  const { playing, toggle } = useTrackPlayer(track.id, track.url);
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5">
      <button type="button" onClick={toggle} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/10 flex items-center justify-center" aria-label="Preview">
        {track.art ? <img src={track.art} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <Music size={18} className="text-white/40" />}
        <span className="relative z-10 rounded-full bg-black/60 p-1.5 text-white">{playing ? <Pause size={14} /> : <Play size={14} />}</span>
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{track.title}</p>
        <p className="truncate text-xs text-white/50">{track.artist}</p>
      </div>
      <button type="button" onClick={() => onPick(track)} className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-black active:scale-95">Use</button>
    </div>
  );
};

export const MusicPicker = ({ onClose, onPick }) => {
  const [q, setQ] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("popular");

  useEffect(() => {
    if (tab === "indie" && !audiusReady) return undefined;
    const ctrl = new AbortController();
    const wait = setTimeout(() => {
      setLoading(true);
      setError("");
      const run = tab === "popular" ? popularTracks(q) : (q.trim() ? searchTracks(q.trim(), ctrl.signal) : trendingTracks(ctrl.signal));
      run
        .then((list) => { setTracks(list); setLoading(false); })
        .catch((e) => { if (e.name !== "AbortError") { setError("Could not load music. Check your internet and try again."); setLoading(false); } });
    }, q.trim() ? 450 : 0);
    return () => { clearTimeout(wait); ctrl.abort(); };
  }, [q, tab]);

  useEffect(() => () => pauseTrack(), []);

  const close = () => { pauseTrack(); onClose(); };

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={close}>
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border border-white/10 bg-[#0b0b0f] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-black text-white"><Music size={18} className="text-primary" /> Add music</h3>
          <button type="button" onClick={close} className="rounded-full p-2 text-white/60 hover:bg-white/10" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex gap-2 px-5 pb-3">
          <button type="button" onClick={() => { setTracks([]); setTab("popular"); }} className={"rounded-full px-4 py-1.5 text-xs font-bold " + (tab === "popular" ? "bg-primary text-black" : "bg-white/10 text-white/70")}>Popular (30s clips)</button>
          <button type="button" onClick={() => { setTracks([]); setTab("indie"); }} className={"rounded-full px-4 py-1.5 text-xs font-bold " + (tab === "indie" ? "bg-primary text-black" : "bg-white/10 text-white/70")}>Independent (full)</button>
        </div>
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
            <Search size={16} className="text-white/40" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search songs or artists" className="w-full bg-transparent text-base text-white placeholder:text-white/30 focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-5">
          {tab === "indie" && !audiusReady && <p className="px-4 py-6 text-center text-sm text-white/60">Music is not switched on yet. The music key is missing.</p>}
          {(tab === "popular" || audiusReady) && !q.trim() && !loading && !error && tracks.length > 0 && <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-widest text-white/30">{tab === "popular" ? "Afrobeats picks" : "Trending now"}</p>}
          {loading && <p className="px-4 py-6 text-center text-sm text-white/50">Loading...</p>}
          {error && <p className="px-4 py-6 text-center text-sm text-red-400">{error}</p>}
          {!loading && !error && (tab === "popular" || audiusReady) && tracks.length === 0 && <p className="px-4 py-6 text-center text-sm text-white/50">No songs found.</p>}
          {!loading && !error && tracks.map((t) => <Row key={t.id} track={t} onPick={(x) => { pauseTrack(); onPick(x); }} />)}
        </div>
        <p className="px-5 pb-4 text-center text-[10px] text-white/25">Popular: 30-second clips from Apple. Independent: full songs from Audius.</p>
      </div>
    </div>,
    document.body
  );
};
