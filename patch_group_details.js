import fs from 'fs';

let content = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

// Remove import
content = content.replace(/import \{ GroupChat \} from "\.\.\/components\/groups\/GroupChat";\r?\n/, '');

// Remove block
const blockRegex = /          \{\/\* CHAT TAB \*\/\}\r?\n          \{activeTab === "chat" && \([\s\S]*?\}\)\}\r?\n\r?\n            \{\/\* POSTS TAB \*\/\}/;
content = content.replace(blockRegex, '          {/* POSTS TAB */}');

fs.writeFileSync('frontend/pages/GroupDetails.jsx', content);
console.log("Patched GroupDetails!");
