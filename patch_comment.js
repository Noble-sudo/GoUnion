import fs from 'fs';

let content = fs.readFileSync('frontend/components/feed/CommentSection.jsx', 'utf8');

// Replace the icon imports
content = content.replace(
  'import { Send, Heart, CornerDownRight, X, Smile } from "lucide-react";',
  'import { Send, Heart, CornerDownRight, X, Smile, Keyboard } from "lucide-react";'
);

// Replace the button and EmojiPicker logic in CommentSection.jsx
const oldInputSection = `
                                _jsx("button", { type: "button", onClick: () => setIsEmojiPickerOpen(!isEmojiPickerOpen), className: "h-11 w-11 shrink-0 flex items-center justify-center text-zinc-400 hover:text-white transition-colors", children: _jsx(Smile, { size: 20, className: isEmojiPickerOpen ? "text-primary" : "" }) }),
                                isEmojiPickerOpen && (_jsx("div", { className: "absolute bottom-14 left-0 z-50", children: _jsx(EmojiPicker, { theme: Theme.DARK, onEmojiClick: handleEmojiClick, lazyLoadEmojis: true }) })),
                                _jsx("textarea", { rows: 1, value: content, onChange: (e) => setContent(e.target.value), placeholder: replyTarget ? \`Reply to @\${replyTarget.user?.username}\` : "Write a comment...", className: "min-h-[44px] max-h-28 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-zinc-100 focus:outline-none transition-all placeholder:text-zinc-500 hide-scrollbar" })
`;

const newInputSection = `
                                _jsx("button", { type: "button", onClick: () => { if (isEmojiPickerOpen) { setIsEmojiPickerOpen(false); } else { setIsEmojiPickerOpen(true); } }, className: "h-11 w-11 shrink-0 flex items-center justify-center text-zinc-400 hover:text-white transition-colors", children: isEmojiPickerOpen ? _jsx(Keyboard, { size: 20, className: "text-primary animate-in zoom-in duration-200" }) : _jsx(Smile, { size: 20, className: "animate-in zoom-in duration-200" }) }),
                                _jsx("textarea", { rows: 1, value: content, onChange: (e) => setContent(e.target.value), onFocus: () => setIsEmojiPickerOpen(false), placeholder: replyTarget ? \`Reply to @\${replyTarget.user?.username}\` : "Write a comment...", className: "min-h-[44px] max-h-28 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-zinc-100 focus:outline-none transition-all placeholder:text-zinc-500 hide-scrollbar" })
                            ]}), 
                            _jsx("button", { type: "submit", disabled: !content.trim() || createCommentMutation.isPending, className: "h-11 w-11 shrink-0 flex items-center justify-center bg-violet-600 text-white rounded-2xl hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20", "aria-label": "Send comment", children: _jsx(Send, { size: 17 }) })
                        ] }),
                        isEmojiPickerOpen && (_jsx("div", { className: "w-full overflow-hidden flex justify-center border-t border-white/5 pt-2 mt-1 animate-in slide-in-from-bottom duration-200", children: _jsx(EmojiPicker, { theme: Theme.DARK, onEmojiClick: handleEmojiClick, lazyLoadEmojis: true, style: { width: '100%', height: '300px', border: 'none', background: 'transparent' } }) }))
`;

// It's safer to use regex replacement with exact match of what's there
const regex = /_jsx\("button", { type: "button", onClick: \(\) => setIsEmojiPickerOpen\(!isEmojiPickerOpen\).*?\n.*?isEmojiPickerOpen && \(_jsx\("div", { className: "absolute bottom-14 left-0 z-50".*?\n.*?_jsx\("textarea", { rows: 1, value: content, onChange: \(e\) => setContent\(e\.target\.value\).*?\n.*?\]\}\), \n.*?_jsx\("button", { type: "submit".*?\n.*?\] \}\)/s;

content = content.replace(regex, newInputSection);

fs.writeFileSync('frontend/components/feed/CommentSection.jsx', content);
console.log('CommentSection.jsx patched!');
