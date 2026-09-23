import fs from 'fs';

function patchFile(filePath, search, replace) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
  }
}

// 1. CreatePost.jsx
patchFile(
  'frontend/components/feed/CreatePost.jsx',
  'onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}',
  'onClick={() => { if (!isEmojiPickerOpen) document.activeElement?.blur(); setIsEmojiPickerOpen(!isEmojiPickerOpen); }}'
);

// 2. CreateStatusModal.jsx
patchFile(
  'frontend/components/feed/CreateStatusModal.jsx',
  'onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}',
  'onClick={() => { if (!isEmojiPickerOpen) document.activeElement?.blur(); setIsEmojiPickerOpen(!isEmojiPickerOpen); }}'
);

// 3. CommentSection.jsx
patchFile(
  'frontend/components/feed/CommentSection.jsx',
  'onClick: () => { if (isEmojiPickerOpen) { setIsEmojiPickerOpen(false); } else { setIsEmojiPickerOpen(true); } }',
  'onClick: () => { if (isEmojiPickerOpen) { setIsEmojiPickerOpen(false); } else { document.activeElement?.blur(); setIsEmojiPickerOpen(true); } }'
);

// 4. Messages.jsx
patchFile(
  'frontend/pages/Messages.jsx',
  'setIsEmojiPickerOpen(true);',
  'document.activeElement?.blur();\n                                                        setIsEmojiPickerOpen(true);'
);

console.log("Patched emoji buttons to explicitly blur native keyboard");
