import fs from 'fs';

let content = fs.readFileSync('temp_comment.js', 'utf8');

content = content.replace(
  'import { Send, Heart, CornerDownRight, X, Smile } from "lucide-react";',
  'import { Send, Heart, CornerDownRight, X, Smile, Keyboard } from "lucide-react";'
);

content = content.replace(
  /_jsx\("button", \{ type: "button", onClick: \(\) => setIsEmojiPickerOpen\(!isEmojiPickerOpen\).*?\}\),/,
  '_jsx("button", { type: "button", onClick: () => { if (isEmojiPickerOpen) { setIsEmojiPickerOpen(false); } else { setIsEmojiPickerOpen(true); } }, className: "h-11 w-11 shrink-0 flex items-center justify-center text-zinc-400 hover:text-white transition-colors", children: isEmojiPickerOpen ? _jsx(Keyboard, { size: 20, className: "text-primary animate-in zoom-in duration-200" }) : _jsx(Smile, { size: 20, className: "animate-in zoom-in duration-200" }) }),'
);

content = content.replace(
  /isEmojiPickerOpen && \(_jsx\("div", \{ className: "absolute bottom-14 left-0 z-50".*?\}\)\),/,
  ''
);

content = content.replace(
  /_jsx\("textarea", \{ rows: 1, value: content, onChange: \(e\) => setContent\(e.target.value\), placeholder:/,
  '_jsx("textarea", { rows: 1, value: content, onChange: (e) => setContent(e.target.value), onFocus: () => setIsEmojiPickerOpen(false), placeholder:'
);

content = content.replace(
  /_jsx\(Send, \{ size: 17 \} \) \}\)\n\s*\] \}\) \] \}\) \] \}\)\)\);/,
  '_jsx(Send, { size: 17 }) })\n                        ] }),\n                        isEmojiPickerOpen && (_jsx("div", { className: "w-full overflow-hidden flex justify-center border-t border-white/5 pt-2 mt-1 animate-in slide-in-from-bottom duration-200", children: _jsx(EmojiPicker, { theme: Theme.DARK, onEmojiClick: handleEmojiClick, lazyLoadEmojis: true, style: { width: "100%", height: "300px", border: "none", background: "transparent" } }) }))\n                    ] }) ] }));'
);

fs.writeFileSync('frontend/components/feed/CommentSection.jsx', content);
console.log("Success with regex!");
