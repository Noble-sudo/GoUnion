const fs = require('fs');

const file = 'frontend/components/feed/CommentSection.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { Send, Heart, CornerDownRight, X, Smile, Keyboard } from "lucide-react";',
  'import { Send, Heart, CornerDownRight, X, Smile, Keyboard, Shield } from "lucide-react";'
);

fs.writeFileSync(file, content);
console.log('Patched CommentSection.jsx imports');
