import fs from 'fs';

let content = fs.readFileSync('frontend/components/feed/CommentSection.jsx', 'utf8');

if (!content.includes('import EmojiPicker')) {
  content = content.replace(
    'import { Avatar } from "../ui/Avatar";',
    'import { Avatar } from "../ui/Avatar";\nimport EmojiPicker, { Theme } from "emoji-picker-react";'
  );
}

const emojiLogic = `
const handleEmojiClick = (emojiObj) => setContent(prev => prev + emojiObj.emoji);
`;

if (!content.includes('handleEmojiClick')) {
  content = content.replace(
    'const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);',
    'const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);\n      ' + emojiLogic
  );
}

const emojiPickerCode = `,
  isEmojiPickerOpen && _jsx("div", {
    className: "w-full overflow-hidden flex justify-center border-t border-white/5 pt-2 mt-2 mb-6 animate-in slide-in-from-bottom duration-200",
    children: _jsx(EmojiPicker, { theme: Theme.DARK, onEmojiClick: handleEmojiClick, lazyLoadEmojis: true, style: { width: '100%', height: '300px', border: 'none', background: 'transparent' } })
  })
] }) ] }));`;

content = content.replace(
  '] }) ] }));',
  emojiPickerCode
);

fs.writeFileSync('frontend/components/feed/CommentSection.jsx', content);
console.log('Added EmojiPicker to CommentSection');
