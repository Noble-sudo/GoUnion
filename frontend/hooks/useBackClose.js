import { useEffect, useRef } from "react";

// Makes the phone's back button close an open pop-up first (keypad, sheet, menu, modal)
// instead of leaving the page. Several can be open at once: back closes the newest one.
const stack = [];
let ignore = 0;
let bound = false;

const onPop = () => {
  if (ignore > 0) { ignore -= 1; return; }
  const top = stack.pop();
  if (top) top.close();
};

export const useBackClose = (open, onClose) => {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    if (!bound) { window.addEventListener("popstate", onPop); bound = true; }
    const marker = "ov" + Date.now() + "-" + Math.random();
    const entry = { marker: marker, close: () => closeRef.current && closeRef.current() };
    window.history.pushState(Object.assign({}, window.history.state || {}, { __overlay: marker }), "");
    stack.push(entry);
    return () => {
      const i = stack.indexOf(entry);
      if (i === -1) return; // already closed by the back button
      const wasTop = i === stack.length - 1;
      stack.splice(i, 1);
      // Closed with a button on screen: remove our extra history step, but only if we are still on it.
      if (wasTop && window.history.state && window.history.state.__overlay === marker) {
        ignore += 1;
        window.history.back();
      }
    };
  }, [open]);
};
