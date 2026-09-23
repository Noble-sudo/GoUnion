import fs from 'fs';

let content = fs.readFileSync('frontend/components/feed/CreateStatusModal.jsx', 'utf8');

// Imports
content = content.replace(
  'import { X, Camera, Image as ImageIcon, Send, Music } from "lucide-react";',
  'import { X, Camera, Image as ImageIcon, Send, Music, Smile, Keyboard } from "lucide-react";\nimport EmojiPicker, { Theme } from "emoji-picker-react";'
);

// State
content = content.replace(
  'const [preview, setPreview] = useState(null);',
  'const [preview, setPreview] = useState(null);\n  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);'
);

// onFocus textarea and handleEmojiClick
content = content.replace(
  '<textarea value={content} onChange={(e) => setContent(e.target.value)}',
  `const handleEmojiClick = (emojiObj) => setContent(prev => prev + emojiObj.emoji);\n\n                <textarea onFocus={() => setIsEmojiPickerOpen(false)} value={content} onChange={(e) => setContent(e.target.value)}`
);

// Button
content = content.replace(
  '<button onClick={() => setShowCamera(true)}',
  `<button onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="flex items-center gap-2 hover:text-primary transition-colors">
                        {isEmojiPickerOpen ? <Keyboard size={20} className="text-primary" /> : <Smile size={20} />}
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Emoji</span>
                      </button>
                      
                      <button onClick={() => setShowCamera(true)}`
);

// EmojiPicker renderer
content = content.replace(
  '</button>\n              </div>\n            </motion.div>',
  `</button>
                {isEmojiPickerOpen && (
                  <div className="w-full overflow-hidden flex justify-center border-t border-white/5 pt-2 mt-4 animate-in slide-in-from-bottom duration-200">
                    <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} style={{ width: '100%', height: '350px', border: 'none', background: 'transparent' }} />
                  </div>
                )}
              </div>
            </motion.div>`
);

fs.writeFileSync('frontend/components/feed/CreateStatusModal.jsx', content);
console.log('CreateStatusModal.jsx patched!');
