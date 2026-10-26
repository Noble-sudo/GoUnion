// Trims long videos to 30 seconds and shrinks big ones on the phone, before anything is uploaded.
// Works for every file picker in the app (posts, reels, status, chat).
const MB = 1024 * 1024;
const MAX_SECONDS = 30;
const SHRINK_ABOVE = 20 * MB;
const LONG_SIDE = 1280;
const VIDEO_BPS = 2000000;
const AUDIO_BPS = 96000;
const MAX_INPUT = 1024 * MB;

const canRecord = () =>
  typeof window !== "undefined" &&
  typeof MediaRecorder !== "undefined" &&
  !!HTMLCanvasElement.prototype.captureStream;

const pickMime = () => {
  const list = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const m of list) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) { /* ignore */ }
  }
  return "";
};

const clock = (s) => {
  const t = Math.max(0, Math.round(s));
  return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
};

const makeVideo = (url) => {
  const v = document.createElement("video");
  v.preload = "auto";
  v.playsInline = true;
  v.setAttribute("playsinline", "");
  v.setAttribute("webkit-playsinline", "");
  v.src = url;
  return v;
};

const readMeta = (video) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 15000);
    const ok = () => {
      clearTimeout(timer);
      resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => { clearTimeout(timer); reject(new Error("unreadable")); };
    video.onloadedmetadata = () => {
      if (Number.isFinite(video.duration) && video.videoWidth) return ok();
      video.ontimeupdate = () => {
        video.ontimeupdate = null;
        video.currentTime = 0;
        ok();
      };
      video.currentTime = 1e101;
    };
  });

const seekTo = (video, t) =>
  new Promise((resolve) => {
    if (Math.abs(video.currentTime - t) < 0.05) return resolve();
    const done = () => { video.removeEventListener("seeked", done); resolve(); };
    video.addEventListener("seeked", done);
    video.currentTime = t;
  });

// Plays the chosen part and records it again at a smaller size.
const recordClip = async (video, meta, start, length, onProgress, state) => {
  const scale = Math.min(1, LONG_SIDE / Math.max(meta.width, meta.height));
  const w = Math.max(2, Math.round((meta.width * scale) / 2) * 2);
  const h = Math.max(2, Math.round((meta.height * scale) / 2) * 2);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const stream = canvas.captureStream(30);

  let audioCtx = null;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    const source = audioCtx.createMediaElementSource(video);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    video.muted = false;
  } catch (e) {
    audioCtx = null;
    video.muted = true;
  }

  const mime = pickMime();
  const options = { videoBitsPerSecond: VIDEO_BPS, audioBitsPerSecond: AUDIO_BPS };
  if (mime) options.mimeType = mime;
  const recorder = new MediaRecorder(stream, options);
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const stopped = new Promise((resolve) => { recorder.onstop = resolve; });

  await seekTo(video, start);
  ctx.drawImage(video, 0, 0, w, h);
  recorder.start(500);
  await video.play();

  await new Promise((resolve) => {
    const safety = setTimeout(resolve, (length + 20) * 1000);
    const tick = () => {
      if (state.cancelled) { clearTimeout(safety); return resolve(); }
      ctx.drawImage(video, 0, 0, w, h);
      const done = video.currentTime - start;
      onProgress(Math.min(1, Math.max(0, done / length)));
      if (done >= length || video.ended) { clearTimeout(safety); return resolve(); }
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(tick);
      else requestAnimationFrame(tick);
    };
    tick();
  });

  video.pause();
  if (recorder.state !== "inactive") recorder.stop();
  await stopped;
  if (audioCtx) { try { await audioCtx.close(); } catch (e) { /* ignore */ } }
  if (state.cancelled) return null;

  const type = (recorder.mimeType || mime || "video/webm").split(";")[0];
  const ext = type.indexOf("mp4") !== -1 ? "mp4" : "webm";
  return new Blob(chunks, { type }).size ? { blob: new Blob(chunks, { type }), type, ext } : null;
};

const el = (tag, css, text) => {
  const node = document.createElement(tag);
  if (css) node.style.cssText = css;
  if (text) node.textContent = text;
  return node;
};

// The pop-up the person sees. Resolves with the new File, "original", or null (cancelled).
const runDialog = (file, url, video, meta) =>
  new Promise((resolve) => {
    const needsTrim = meta.duration > MAX_SECONDS + 0.5;
    const length = Math.min(MAX_SECONDS, meta.duration);
    const state = { cancelled: false };
    let start = 0;

    const overlay = el("div", "position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif");
    const card = el("div", "width:100%;max-width:420px;max-height:92vh;overflow:auto;background:#111113;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:16px;color:#fff");
    const title = el("div", "font-weight:900;font-size:18px", needsTrim ? "Trim your video" : "Shrink your video");
    const sub = el(
      "div",
      "margin-top:4px;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.6)",
      needsTrim
        ? "Videos can be up to 30 seconds. Slide to choose where yours starts."
        : "This video is " + Math.round(file.size / MB) + " MB. We will shrink it so it uploads fast."
    );
    video.style.cssText = "width:100%;max-height:38vh;margin-top:12px;border-radius:14px;background:#000;object-fit:contain";
    video.muted = true;
    video.controls = false;

    const label = el("div", "margin-top:10px;font-size:13px;font-weight:700;color:#22d3ee;text-align:center");
    const slider = el("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = String(Math.max(0, meta.duration - MAX_SECONDS));
    slider.step = "0.1";
    slider.value = "0";
    slider.style.cssText = "width:100%;margin-top:8px";
    const setLabel = () => { label.textContent = "Selected: " + clock(start) + " to " + clock(start + length) + " (of " + clock(meta.duration) + ")"; };
    setLabel();
    slider.oninput = () => {
      start = Number(slider.value);
      setLabel();
      try { video.currentTime = start; } catch (e) { /* ignore */ }
    };

    const barWrap = el("div", "display:none;margin-top:14px");
    const barTrack = el("div", "height:8px;border-radius:99px;background:rgba(255,255,255,0.12);overflow:hidden");
    const bar = el("div", "height:100%;width:0%;background:#22d3ee;transition:width 0.2s");
    barTrack.appendChild(bar);
    const barText = el("div", "margin-top:8px;font-size:12px;color:rgba(255,255,255,0.6);text-align:center", "Preparing your video. Keep Konnect open.");
    barWrap.appendChild(barTrack);
    barWrap.appendChild(barText);

    const row = el("div", "display:flex;gap:8px;margin-top:14px");
    const cancel = el("button", "height:44px;padding:0 18px;border-radius:12px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#fff;font-weight:700;font-size:14px", "Cancel");
    const go = el("button", "height:44px;flex:1;border-radius:12px;border:0;background:#22d3ee;color:#000;font-weight:800;font-size:14px", needsTrim ? "Use this clip" : "Shrink and continue");
    row.appendChild(cancel);
    row.appendChild(go);

    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(video);
    if (needsTrim) { card.appendChild(label); card.appendChild(slider); }
    card.appendChild(barWrap);
    card.appendChild(row);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const close = (value) => {
      try { video.pause(); } catch (e) { /* ignore */ }
      overlay.remove();
      resolve(value);
    };

    cancel.onclick = () => { state.cancelled = true; close(null); };
    go.onclick = async () => {
      go.disabled = true;
      go.style.opacity = "0.5";
      slider.disabled = true;
      slider.style.display = "none";
      label.style.display = "none";
      row.removeChild(go);
      barWrap.style.display = "block";
      sub.textContent = "Preparing your video. This takes about as long as the clip.";
      try {
        const result = await recordClip(video, meta, start, length, (p) => {
          bar.style.width = Math.round(p * 100) + "%";
          barText.textContent = "Preparing your video... " + Math.round(p * 100) + "%. Keep Konnect open.";
        }, state);
        if (state.cancelled) return;
        if (!result) return close("original");
        const base = (file.name || "video").replace(/\.[^.]+$/, "");
        close(new File([result.blob], base + "." + result.ext, { type: result.type, lastModified: Date.now() }));
      } catch (e) {
        close("original");
      }
    };
  });

const showNote = (text) => {
  const box = el("div", "position:fixed;top:16px;left:16px;right:16px;margin:0 auto;max-width:420px;z-index:99999;background:#111113;color:#fff;border:1px solid rgba(255,80,80,0.5);border-radius:14px;padding:14px 16px;font:600 14px/1.4 system-ui,sans-serif;text-align:center", text);
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4500);
};

const release = (input) => {
  input.__videoPrepped = true;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.__videoPrepped = false;
};

document.addEventListener("change", async (event) => {
  const input = event.target;
  if (!input || input.tagName !== "INPUT" || input.type !== "file" || input.__videoPrepped) return;
  if (!input.files || input.files.length !== 1) return;
  const file = input.files[0];
  if (!(file.type || "").startsWith("video/") || file.size > MAX_INPUT || !canRecord()) return;

  event.stopImmediatePropagation();
  const url = URL.createObjectURL(file);
  const video = makeVideo(url);
  try {
    let meta;
    try { meta = await readMeta(video); } catch (e) { meta = null; }
    if (!meta || !meta.duration || !meta.width) { URL.revokeObjectURL(url); return release(input); }

    const needsWork = meta.duration > MAX_SECONDS + 0.5 || file.size > SHRINK_ABOVE;
    if (!needsWork) { URL.revokeObjectURL(url); return release(input); }

    const result = await runDialog(file, url, video, meta);
    URL.revokeObjectURL(url);
    if (result === null) { input.value = ""; return; }
    if (result === "original") {
      if (meta.duration > MAX_SECONDS + 0.5) {
        input.value = "";
        showNote("Could not prepare that video on this phone. Pick one that is 30 seconds or shorter.");
        return;
      }
      return release(input);
    }
    const transfer = new DataTransfer();
    transfer.items.add(result);
    input.files = transfer.files;
    release(input);
  } catch (e) {
    URL.revokeObjectURL(url);
    release(input);
  }
}, true);
