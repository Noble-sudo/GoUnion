import fs from 'fs';

let content = fs.readFileSync('temp_comment.js', 'utf8');

const s1 = '_jsx("button", { type: "button", onClick: () => setIsEmojiPickerOpen(!isEmojiPickerOpen), className: "h-11 w-11 shrink-0 flex items-center justify-center text-zinc-400 hover:text-white transition-colors", children: _jsx(Smile, { size: 20, className: isEmojiPickerOpen ? "text-primary" : "" }) }),';
const r1 = '_jsx("button", { type: "button", onClick: () => { if (isEmojiPickerOpen) { setIsEmojiPickerOpen(false); } else { setIsEmojiPickerOpen(true); } }, className: "h-11 w-11 shrink-0 flex items-center justify-center text-zinc-400 hover:text-white transition-colors", children: isEmojiPickerOpen ? _jsx(Keyboard, { size: 20, className: "text-primary animate-in zoom-in duration-200" }) : _jsx(Smile, { size: 20, className: "animate-in zoom-in duration-200" }) }),';

const s2 = 'isEmojiPickerOpen && (_jsx("div", { className: "absolute bottom-14 left-0 z-50", children: _jsx(EmojiPicker, { theme: Theme.DARK, onEmojiClick: handleEmojiClick, lazyLoadEmojis: true }) })),';
const r2 = '';

const s3 = '_jsx("textarea", { rows: 1, value: content, onChange: (e) => setContent(e.target.value), placeholder:';
const r3 = '_jsx("textarea", { rows: 1, value: content, onChange: (e) => setContent(e.target.value), onFocus: () => setIsEmojiPickerOpen(false), placeholder:';

const s4 = '_jsx(Send, { size: 17 }) })\n                        ] }) ] }) ] }));';
const r4 = '_jsx(Send, { size: 17 }) })\n                        ] }),\n                        isEmojiPickerOpen && (_jsx("div", { className: "w-full overflow-hidden flex justify-center border-t border-white/5 pt-2 mt-1 animate-in slide-in-from-bottom duration-200", children: _jsx(EmojiPicker, { theme: Theme.DARK, onEmojiClick: handleEmojiClick, lazyLoadEmojis: true, style: { width: "100%", height: "300px", border: "none", background: "transparent" } }) }))\n                    ] }) ] }));';

if (content.includes(s1)) {
  content = content.replace('import { Send, Heart, CornerDownRight, X, Smile } from "lucide-react";', 'import { Send, Heart, CornerDownRight, X, Smile, Keyboard } from "lucide-react";');
  content = content.replace(s1, r1);
  content = content.replace(s2, r2);
  content = content.replace(s3, r3);
  content = content.replace(s4, r4);
  fs.writeFileSync('frontend/components/feed/CommentSection.jsx', content);
  console.log("Success! Restored and patched correctly.");
} else {
  console.log("Failed to find s1");
}
