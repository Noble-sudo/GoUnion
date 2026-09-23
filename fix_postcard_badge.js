const fs = require('fs');
let content = fs.readFileSync('frontend/components/feed/PostCard.jsx', 'utf8');

// The hardcoded checkmark looks like this:
// _jsx("div", { className: "bg-primary-foreground/10 text-primary-foreground p-0.5 rounded-full", children: _jsx("svg", { className: "w-3 h-3 text-blue-400", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" }) }) })

content = content.replace(
  /_jsx\("div", \{ className: "bg-primary-foreground\/10 text-primary-foreground p-0\.5 rounded-full"([^\]]+)\} \)/g,
  `post.author.verification_status === 'VERIFIED' && _jsx("div", { className: "bg-primary-foreground/10 text-primary-foreground p-0.5 rounded-full"$1} )`
);

fs.writeFileSync('frontend/components/feed/PostCard.jsx', content);
console.log('Fixed verified badge in PostCard');
