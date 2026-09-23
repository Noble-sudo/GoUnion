import fs from 'fs';

// --- Dashboard.jsx ---
let dashboardCode = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');

// Fix the .includes error
dashboardCode = dashboardCode.replace(
  /posts = posts.filter\(p => p\.author\?\.isFollowing \|\| p\.author\?\.is_following \|\| user\?\.following\?\.includes\(p\.author\?\.id\)\);/g,
  'posts = posts.filter(p => Boolean(p.author?.isFollowing) || Boolean(p.author?.is_following));'
);

// Remove padding so posts touch edges on mobile
dashboardCode = dashboardCode.replace(
  '<div className="w-full space-y-6 px-5 sm:px-0 mt-6">',
  '<div className="w-full space-y-6 sm:px-0 mt-6">'
);

fs.writeFileSync('frontend/pages/Dashboard.jsx', dashboardCode);

// --- PostCard.jsx ---
let postCardCode = fs.readFileSync('frontend/components/feed/PostCard.jsx', 'utf8');

// Make it touch edges on mobile
postCardCode = postCardCode.replace(
  'className: "rounded-2xl border border-white/5 bg-white/[0.02] mb-6 overflow-hidden transition-colors hover:border-white/10 group"',
  'className: "rounded-none sm:rounded-2xl border-y sm:border-x border-white/5 bg-white/[0.02] mb-6 overflow-hidden transition-colors hover:border-white/10 group"'
);

fs.writeFileSync('frontend/components/feed/PostCard.jsx', postCardCode);

console.log('Patched Dashboard and PostCard');
