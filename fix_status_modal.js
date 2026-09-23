import fs from 'fs';

let content = fs.readFileSync('frontend/components/feed/CreateStatusModal.jsx', 'utf8');

// Remove from JSX
content = content.replace(
  'const handleEmojiClick = (emojiObj) => setContent(prev => prev + emojiObj.emoji);',
  ''
);

// Add to component body
const findFunc = 'export const CreateStatusModal = ({ isOpen, onClose, onSuccess }) => {\n  const [content, setContent] = useState("");';
const replaceFunc = 'export const CreateStatusModal = ({ isOpen, onClose, onSuccess }) => {\n  const [content, setContent] = useState("");\n  const handleEmojiClick = (emojiObj) => setContent(prev => prev + emojiObj.emoji);';

content = content.replace(findFunc, replaceFunc);

fs.writeFileSync('frontend/components/feed/CreateStatusModal.jsx', content);
console.log('Fixed CreateStatusModal text leak');
