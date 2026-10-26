import React, { useMemo, useState } from "react";

// Same shape the old library used, so every screen keeps working: <EmojiPicker onEmojiClick={(e) => e.emoji} />
export const Theme = { DARK: "dark", LIGHT: "light", AUTO: "auto" };

const RECENT_KEY = "konnect-emoji-recent";

// Emoji are listed as unicode numbers (ranges with "-", joined pieces with "+") so this file stays plain text.
const build = (spec) => {
  const out = [];
  spec.split(" ").forEach((part) => {
    if (!part) return;
    const range = part.split("-");
    if (range.length === 2) {
      for (let n = parseInt(range[0], 16); n <= parseInt(range[1], 16); n++) out.push(String.fromCodePoint(n));
    } else {
      out.push(part.split("+").map((h) => String.fromCodePoint(parseInt(h, 16))).join(""));
    }
  });
  return Array.from(new Set(out));
};

const CATEGORIES = [
  { id: "faces", icon: "1F600", name: "Smileys", spec: "1F600-1F64F 1F910-1F917 1F920-1F925 1F927-1F92F 1F4A9 1F47B 1F480 1F47D 1F47E" },
  { id: "hands", icon: "1F44D", name: "Hands", spec: "1F44D 1F44E 1F44A 270A 270B 1F44B 1F44C 270C+FE0F 1F91E 1F91F 1F918 1F919 1F446-1F449 1F44F 1F450 1F64C 1F64F 1F91D 1F4AA 1F440 1F442-1F445" },
  { id: "hearts", icon: "2764+FE0F", name: "Hearts and symbols", spec: "2764+FE0F 1F493-1F49F 1F5A4 1F9E1 1F4AF 1F4A5 1F4A2 1F4A6 1F4A8 1F4AB 1F4AC 1F4A4 2728 2B50 1F31F 26A1 1F525 2705 274C 2757 2753 1F6AB" },
  { id: "animals", icon: "1F436", name: "Animals", spec: "1F400-1F43E 1F980-1F991" },
  { id: "nature", icon: "1F33F", name: "Nature", spec: "1F331-1F344 1F490 1F300-1F320" },
  { id: "food", icon: "1F354", name: "Food and drink", spec: "1F345-1F37C 1F37E 1F37F 1F950-1F95E 1F32D-1F32F" },
  { id: "fun", icon: "26BD", name: "Sport, music and fun", spec: "26BD 26BE 1F3C0-1F3CA 1F380-1F393 1F3A0-1F3BC" },
  { id: "travel", icon: "1F697", name: "Travel and places", spec: "1F680-1F6B6 1F3E0-1F3F0" },
  { id: "objects", icon: "1F4A1", name: "Objects", spec: "1F451-1F463 1F4A1 1F4B0-1F4B8 1F4BB-1F4FC 1F50B-1F50E 1F511-1F513" },
  { id: "flags", icon: "1F1F3+1F1EC", name: "Flags", spec: "1F1F3+1F1EC 1F1EC+1F1ED 1F1FF+1F1E6 1F1F0+1F1EA 1F1FA+1F1F8 1F1EC+1F1E7 1F1E8+1F1E6 1F1E8+1F1F2 1F1F8+1F1F3 1F1E9+1F1EA 1F1EB+1F1F7 1F1EE+1F1F3 1F1E7+1F1F7 1F1E8+1F1F3 1F1EF+1F1F5 1F1F8+1F1E6 1F1E6+1F1EA 1F1EA+1F1EC 1F1F2+1F1E6" },
];

// A few search words so people can type "love" or "laugh".
const WORDS = {
  laugh: "1F602 1F923 1F606 1F605", lol: "1F602 1F923", haha: "1F602 1F923 1F606", love: "2764+FE0F 1F60D 1F618 1F495", heart: "2764+FE0F 1F495 1F496 1F49E",
  fire: "1F525 1F4AF", lit: "1F525 1F389", cry: "1F62D 1F622 1F625", sad: "1F622 1F625 1F61E", angry: "1F620 1F621 1F624", mad: "1F620 1F621",
  cool: "1F60E", wow: "1F62E 1F632 1F631", shock: "1F631 1F632", pray: "1F64F", thanks: "1F64F", please: "1F64F", god: "1F64F", clap: "1F44F",
  party: "1F389 1F38A 1F37E", celebrate: "1F389 1F38A", money: "1F4B0 1F4B5 1F4B8 1F911", cash: "1F4B5 1F4B0", food: "1F355 1F354 1F35F", eat: "1F355 1F354 1F35F",
  sleep: "1F634 1F62A", tired: "1F634 1F62B", kiss: "1F618 1F48B", smile: "1F600 1F60A 1F604", happy: "1F600 1F60A 1F604", wink: "1F609",
  think: "1F914", sorry: "1F625 1F64F", ok: "1F44D 1F44C 2705", good: "1F44D 1F44C", yes: "1F44D 2705", no: "1F44E 274C", bad: "1F44E",
  hi: "1F44B", hello: "1F44B", wave: "1F44B", strong: "1F4AA", gym: "1F4AA", football: "26BD", soccer: "26BD", music: "1F3B5 1F3A4 1F3A7",
  song: "1F3B5 1F3A4", book: "1F4DA", study: "1F4DA", school: "1F393 1F4DA", nigeria: "1F1F3+1F1EC", naija: "1F1F3+1F1EC", skull: "1F480 1F635",
  dead: "1F480 1F635", poop: "1F4A9", eyes: "1F440", look: "1F440", hundred: "1F4AF", gift: "1F381", cake: "1F382", birthday: "1F382 1F389",
};

const ch = (spec) => build(spec)[0];

const loadRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 24); } catch (e) { return []; }
};
const saveRecent = (list) => {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 24))); } catch (e) { /* ignore */ }
};

const EmojiKeypad = ({ onEmojiClick, style }) => {
  const [tab, setTab] = useState("faces");
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState(loadRecent);

  const cats = useMemo(() => CATEGORIES.map((c) => ({ id: c.id, icon: ch(c.icon), name: c.name, list: build(c.spec) })), []);

  const pick = (e) => {
    const next = [e].concat(recent.filter((x) => x !== e)).slice(0, 24);
    setRecent(next);
    saveRecent(next);
    if (onEmojiClick) onEmojiClick({ emoji: e, unified: Array.from(e).map((c) => c.codePointAt(0).toString(16)).join("-") });
  };

  const term = q.trim().toLowerCase();
  let title = "";
  let list = [];
  if (term) {
    const set = new Set();
    Object.keys(WORDS).forEach((k) => { if (k.indexOf(term) === 0 || (term.length > 2 && k.indexOf(term) > -1)) build(WORDS[k]).forEach((e) => set.add(e)); });
    list = Array.from(set);
    title = list.length ? "Results" : "";
  } else if (tab === "recent") {
    list = recent;
    title = "Recently used";
  } else {
    const c = cats.find((x) => x.id === tab) || cats[0];
    list = c.list;
    title = c.name;
  }

  const embedded = !!(style && style.width);
  const width = (style && style.width) || "min(92vw, 360px)";
  const height = (style && style.height) || "320px";

  return (
    <div className={"flex flex-col overflow-hidden " + (embedded ? "" : "rounded-2xl border border-white/10 bg-[#0e0e12] shadow-2xl")} style={{ width: width, height: height, maxWidth: "100%" }}>
      <div className="px-3 pt-2 pb-1">
        <input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          placeholder="Search emoji (love, laugh, fire...)"
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-base text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-2" style={{ WebkitOverflowScrolling: "touch" }}>
        {title && <p className="px-1 pt-1 pb-1 text-[11px] font-bold uppercase tracking-widest text-white/30">{title}</p>}
        {term && list.length === 0 && <p className="px-2 py-6 text-center text-sm text-white/40">No emoji found. Try "love", "laugh" or "fire".</p>}
        {!term && tab === "recent" && list.length === 0 && <p className="px-2 py-6 text-center text-sm text-white/40">Emoji you use will show here.</p>}
        <div className="grid grid-cols-8 content-start gap-0.5 pb-2">
          {list.map((e) => (
            <button key={e} type="button" onClick={() => pick(e)} className="flex h-10 items-center justify-center rounded-lg text-2xl active:bg-white/10" style={{ touchAction: "manipulation" }}>{e}</button>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 overflow-x-auto border-t border-white/5">
        <button type="button" onClick={() => { setQ(""); setTab("recent"); }} className={"shrink-0 border-b-2 px-3 py-2 text-lg " + (!term && tab === "recent" ? "border-primary" : "border-transparent opacity-60")}>{String.fromCodePoint(0x1F552)}</button>
        {cats.map((c) => (
          <button key={c.id} type="button" onClick={() => { setQ(""); setTab(c.id); }} className={"shrink-0 border-b-2 px-3 py-2 text-lg " + (!term && tab === c.id ? "border-primary" : "border-transparent opacity-60")}>{c.icon}</button>
        ))}
      </div>
    </div>
  );
};

export default EmojiKeypad;
