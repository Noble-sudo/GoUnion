import fs from 'fs';

let content = fs.readFileSync('frontend/components/feed/CreatePost.jsx', 'utf8');

// Imports
content = content.replace(
  'import { Camera, Image as ImageIcon, X, MapPin } from "lucide-react";',
  'import { Camera, Image as ImageIcon, X, MapPin, Smile, Keyboard } from "lucide-react";\nimport EmojiPicker, { Theme } from "emoji-picker-react";'
);

// State
content = content.replace(
  'const [isFocused, setIsFocused] = useState(false);',
  'const [isFocused, setIsFocused] = useState(false);\n  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);'
);

// handleEmojiClick
content = content.replace(
  'const handleRemoveFile = () => {',
  `const handleEmojiClick = (emojiObj) => { setContent(prev => prev + emojiObj.emoji); };
  const handleRemoveFile = () => {`
);

// Button
content = content.replace(
  '<button type="button" onClick={() => setShowCamera(true)}',
  `<button type="button" onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Emoji">
                      {isEmojiPickerOpen ? <Keyboard className="h-5 w-5 text-blue-400" /> : <Smile className="h-5 w-5" />}
                    </button>
                    <button type="button" onClick={() => setShowCamera(true)}`
);

// onFocus textarea
content = content.replace(
  'onFocus={() => setIsFocused(true)}',
  'onFocus={() => { setIsFocused(true); setIsEmojiPickerOpen(false); }}'
);

// EmojiPicker renderer at the bottom inside the main container but below form
content = content.replace(
  '</form>\n      {showCamera',
  `</form>
      {isEmojiPickerOpen && (
        <div className="w-full overflow-hidden flex justify-center border-t border-white/5 pt-2 mt-2 animate-in slide-in-from-bottom duration-200">
          <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} style={{ width: '100%', height: '350px', border: 'none', background: 'transparent' }} />
        </div>
      )}
      {showCamera`
);

fs.writeFileSync('frontend/components/feed/CreatePost.jsx', content);
console.log('CreatePost.jsx patched!');
