const fs = require('fs');

const file = 'frontend/components/feed/PostCard.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `_jsx("div", { className: "bg-primary-foreground/10 text-primary-foreground p-0.5 rounded-full", children: _jsx("svg", { className: "w-3 h-3 text-blue-400", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" }) }) })`;
const replacement = `(post.author?.verification_status === 'VERIFIED' && _jsx("div", { className: "bg-primary/20 text-primary p-0.5 rounded-full shadow-[0_0_8px_rgba(196,255,14,0.3)]", children: _jsx(Shield, { size: 12 }) }))`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('Patched PostCard.jsx');
