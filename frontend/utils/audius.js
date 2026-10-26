// Audius music helpers: search songs, build the stream link, and one shared player.
import { useEffect, useState } from "react";

const BASE = "https://api.audius.co/v1";
const APP = "Konnect";
const KEY = import.meta.env.VITE_AUDIUS_API_KEY || "";

export const audiusReady = !!KEY;

const qs = (extra) => "app_name=" + APP + (KEY ? "&api_key=" + encodeURIComponent(KEY) : "") + (extra || "");

const clean = (s) => String(s || "").replace(/[|\[\]\r\n]/g, " ").replace(/\s+/g, " ").trim();

const shape = (t) => ({
  id: String(t.id),
  title: clean(t.title) || "Untitled",
  artist: clean(t.user && t.user.name) || "Unknown artist",
  art: (t.artwork && (t.artwork["150x150"] || t.artwork["480x480"])) || "",
  duration: t.duration || 0,
});

const fetchList = async (url, signal) => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Music search failed (" + res.status + ")");
  const json = await res.json();
  return (json.data || []).filter((t) => t && t.id && t.is_streamable !== false).map(shape);
};

export const searchTracks = (q, signal) =>
  fetchList(BASE + "/tracks/search?query=" + encodeURIComponent(q) + "&limit=25&" + qs(), signal);

export const trendingTracks = (signal) =>
  fetchList(BASE + "/tracks/trending?limit=25&" + qs(), signal);

export const streamUrl = (id) => BASE + "/tracks/" + encodeURIComponent(id) + "/stream?" + qs();

// Popular songs (30-second clips) from Apple's free search. Uses a script tag so the browser never blocks it.
const jsonp = (url, timeout) => new Promise((resolve, reject) => {
  const cb = "__kn" + Date.now() + Math.floor(Math.random() * 100000);
  const s = document.createElement("script");
  let timer = null;
  const done = () => { clearTimeout(timer); delete window[cb]; if (s.parentNode) s.parentNode.removeChild(s); };
  timer = setTimeout(() => { done(); reject(new Error("timeout")); }, timeout || 10000);
  window[cb] = (data) => { done(); resolve(data); };
  s.onerror = () => { done(); reject(new Error("network")); };
  s.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "callback=" + cb;
  document.head.appendChild(s);
});

export const popularTracks = async (q) => {
  const term = (q && q.trim()) || "afrobeats";
  const data = await jsonp("https://itunes.apple.com/search?media=music&entity=song&limit=25&country=NG&term=" + encodeURIComponent(term));
  return (data.results || [])
    .filter((r) => r.previewUrl && r.trackId)
    .map((r) => ({
      id: "it-" + r.trackId,
      title: clean(r.trackName) || "Untitled",
      artist: clean(r.artistName) || "Unknown artist",
      art: r.artworkUrl100 || "",
      duration: 30,
      url: String(r.previewUrl).replace(/^http:/, "https:"),
    }));
};

// What we store inside the post caption (no server change needed).
export const encodeTrack = (t) =>
  "Sound: " + clean(t.title) + " - " + clean(t.artist) + "\n[Track: " + String(t.id).replace(/[^A-Za-z0-9_-]/g, "") + "|" + clean(t.title) + "|" + clean(t.artist) + (t.url ? "|" + t.url : "") + "]";

export const parseTrack = (content) => {
  const m = String(content || "").match(/\[Track: ([^|\]]+)\|([^|\]]*)\|([^|\]]*)(?:\|([^|\]]*))?\]/);
  if (!m) return null;
  const u = (m[4] || "").trim();
  return { id: m[1].trim(), title: m[2].trim(), artist: m[3].trim(), url: /^https:\/\/[A-Za-z0-9.-]+\.(apple\.com|mzstatic\.com)\//.test(u) ? u : "" };
};

// ---- one shared audio player for the whole app ----
let audio = null;
let current = null;
let playing = false;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

const getAudio = () => {
  if (!audio) {
    audio = new Audio();
    audio.preload = "none";
    audio.loop = true;
    audio.addEventListener("playing", () => { playing = true; emit(); });
    audio.addEventListener("pause", () => { playing = false; emit(); });
    audio.addEventListener("ended", () => { playing = false; emit(); });
  }
  return audio;
};

export const playTrack = (id, url) => {
  const a = getAudio();
  if (current !== id) {
    current = id;
    a.src = url || streamUrl(id);
  }
  emit();
  return a.play().catch(() => { playing = false; emit(); });
};

export const pauseTrack = (id) => {
  if (audio && (!id || current === id)) audio.pause();
};

export const useTrackPlayer = (id, url) => {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  const isPlaying = playing && current === id;
  return {
    playing: isPlaying,
    toggle: () => (isPlaying ? pauseTrack(id) : playTrack(id, url)),
  };
};
