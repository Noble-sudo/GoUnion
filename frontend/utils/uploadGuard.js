// Stops files that are too big BEFORE they start uploading, and tells the person why.
const MB = 1024 * 1024;
const MAX_VIDEO = 100 * MB;
const MAX_IMAGE = 10 * MB;

const showMessage = (text) => {
  try {
    const old = document.getElementById("upload-guard-msg");
    if (old) old.remove();
    const box = document.createElement("div");
    box.id = "upload-guard-msg";
    box.textContent = text;
    box.style.cssText = "position:fixed;top:16px;left:16px;right:16px;margin:0 auto;max-width:420px;z-index:99999;background:#111113;color:#fff;border:1px solid rgba(255,80,80,0.5);border-radius:14px;padding:14px 16px;font:600 14px/1.4 system-ui,sans-serif;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.6)";
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4500);
  } catch (e) { /* ignore */ }
};

document.addEventListener("change", (event) => {
  const input = event.target;
  if (!input || input.tagName !== "INPUT" || input.type !== "file" || !input.files) return;
  for (const file of Array.from(input.files)) {
    const isVideo = (file.type || "").startsWith("video/");
    const isImage = (file.type || "").startsWith("image/");
    if (isVideo && file.size > MAX_VIDEO) {
      event.stopImmediatePropagation();
      input.value = "";
      showMessage("Video exceeds the 100 MB limit (" + Math.round(file.size / MB) + " MB). Trim it and try again.");
      return;
    }
    if (isImage && file.size > MAX_IMAGE) {
      event.stopImmediatePropagation();
      input.value = "";
      showMessage("Photo exceeds the 10 MB limit (" + Math.round(file.size / MB) + " MB). Pick a smaller one.");
      return;
    }
  }
}, true);
