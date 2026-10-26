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

// What we store inside the post caption (no server change needed).
export const encodeTrack = (t) =>
  "Sound: " + clean(t.title) + " - " + clean(t.artist) + "\n[Track: " + String(t.id).replace(/[^A-Za-z0-9_-]/g, "") + "|" + clean(t.title) + "|" + clean(t.artist) + "]";

export const parseTrack = (content) => {
  const m = String(content || "").match(/\[Track: ([^|\]]+)\|([^|\]]*)\|([^\]]*)\]/);
  return m ? { id: m[1].trim(), title: m[2].trim(), artist: m[3].trim() } : null;
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

export const playTrack = (id) => {
  const a = getAudio();
  if (current !== id) {
    current = id;
    a.src = streamUrl(id);
  }
  emit();
  return a.play().catch(() => { playing = false; emit(); });
};

export const pauseTrack = (id) => {
  if (audio && (!id || current === id)) audio.pause();
};

export const useTrackPlayer = (id) => {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  const isPlaying = playing && current === id;
  return {
    playing: isPlaying,
    toggle: () => (isPlaying ? pauseTrack(id) : playTrack(id)),
  };
};
