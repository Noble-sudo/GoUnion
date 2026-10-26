// Makes every <textarea> grow as the person types, up to about 5 lines (10 for big boxes), then scroll.
const resize = (el) => {
  if (!el || el.tagName !== 'TEXTAREA' || !el.isConnected) return;
  const cs = getComputedStyle(el);
  const fontSize = parseFloat(cs.fontSize) || 16;
  const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.4;
  const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  const maxLines = Number(el.dataset.maxLines) || (el.rows > 1 ? 10 : 5);
  const maxHeight = lineHeight * maxLines + pad;
  el.style.height = 'auto';
  const full = el.scrollHeight;
  el.style.height = Math.min(full, maxHeight) + 'px';
  el.style.overflowY = full > maxHeight ? 'auto' : 'hidden';
};

document.addEventListener('input', (e) => resize(e.target), true);
document.addEventListener('focusin', (e) => resize(e.target), true);

// React clears a box after sending by setting .value in code, which fires no event, so watch for that too.
const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
if (desc && desc.set) {
  Object.defineProperty(HTMLTextAreaElement.prototype, 'value', {
    configurable: true,
    enumerable: desc.enumerable,
    get: desc.get,
    set(v) {
      desc.set.call(this, v);
      requestAnimationFrame(() => resize(this));
    },
  });
}
