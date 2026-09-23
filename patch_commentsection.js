const fs = require('fs');

const file = 'frontend/components/feed/CommentSection.jsx';
let content = fs.readFileSync(file, 'utf8');

// For top-level comments
const target1 = `_jsxs(Link, { to: \`/profile/\${comment.user.username}\`, className: "text-xs font-black text-zinc-100 hover:text-white transition-colors", children: ["@", comment.user.username] })`;
const replacement1 = `_jsxs(Link, { to: \`/profile/\${comment.user.username}\`, className: "text-xs font-black text-zinc-100 hover:text-white transition-colors flex items-center gap-1", children: ["@", comment.user.username, comment.user?.verification_status === 'VERIFIED' && _jsx("div", { className: "bg-primary/20 text-primary p-0.5 rounded-full shadow-[0_0_8px_rgba(196,255,14,0.3)]", children: _jsx(Shield, { size: 10 }) })] })`;

// For replies
const target2 = `_jsxs(Link, { to: \`/profile/\${reply.user.username}\`, className: "text-[11px] font-black text-zinc-100 hover:text-white transition-colors", children: ["@", reply.user.username] })`;
const replacement2 = `_jsxs(Link, { to: \`/profile/\${reply.user.username}\`, className: "text-[11px] font-black text-zinc-100 hover:text-white transition-colors flex items-center gap-1", children: ["@", reply.user.username, reply.user?.verification_status === 'VERIFIED' && _jsx("div", { className: "bg-primary/20 text-primary p-0.5 rounded-full shadow-[0_0_8px_rgba(196,255,14,0.3)]", children: _jsx(Shield, { size: 10 }) })] })`;

// Make sure Shield is imported if not already. But wait, is Shield imported in CommentSection? Let's check imports.
content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

fs.writeFileSync(file, content);
console.log('Patched CommentSection.jsx');
