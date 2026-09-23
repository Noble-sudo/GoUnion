import fs from 'fs';

let content = fs.readFileSync('frontend/components/feed/CreateStatusModal.jsx', 'utf8');

const replacement = `                {isEmojiPickerOpen && (
                  <div className="w-full overflow-hidden flex justify-center border-t border-white/5 pt-2 mt-2 mb-6 animate-in slide-in-from-bottom duration-200">
                    <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} style={{ width: '100%', height: '300px', border: 'none', background: 'transparent' }} />
                  </div>
                )}
                <button onClick={handleSubmit}`;

content = content.replace('                <button onClick={handleSubmit}', replacement);

fs.writeFileSync('frontend/components/feed/CreateStatusModal.jsx', content);
console.log('Added EmojiPicker to CreateStatusModal');
