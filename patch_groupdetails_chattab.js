import fs from 'fs';

let content = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

const regex = /          \{\/\* CHAT TAB \*\/\}\r?\n          \{activeTab === "chat" && \([\s\S]*?\}\)\}\r?\n/;
content = content.replace(regex, '');

fs.writeFileSync('frontend/pages/GroupDetails.jsx', content);
console.log("Patched GroupDetails successfully!");
