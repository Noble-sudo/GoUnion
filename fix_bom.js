import fs from 'fs';
let content = fs.readFileSync('frontend/components/feed/CommentSection.jsx', 'utf8');
content = content.replace(/^[^a-zA-Z]+/, '');
fs.writeFileSync('frontend/components/feed/CommentSection.jsx', content);
console.log('Fixed BOM!');
