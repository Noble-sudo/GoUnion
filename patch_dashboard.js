import fs from 'fs';

let code = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');

// 1. Update greeting based on time
code = code.replace(
  'const firstName = user?.fullName?.split(" ")[0] || user?.username || "Student";',
  'const firstName = user?.fullName?.split(" ")[0] || user?.username || "Student";\n  const hour = new Date().getHours();\n  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";'
);
code = code.replace(
  'Good evening, {firstName}.',
  '{greeting}, {firstName}.'
);
code = code.replace(
  'Welcome, {firstName}.',
  '{greeting}, {firstName}.'
);

// 2. Remove CreatePost
code = code.replace(
  '<div className="px-5 sm:px-0 mb-6">\n          <CreatePost />\n        </div>',
  ''
);

// 3. Filter posts based on activeTab
code = code.replace(
  'const posts = Array.from(new Map((data?.pages.flat() || []).map((post) => [post.id, post])).values());',
  `let posts = Array.from(new Map((data?.pages.flat() || []).map((post) => [post.id, post])).values());
  
  if (activeTab === "following") {
    posts = posts.filter(p => p.author?.isFollowing || p.author?.is_following || user?.following?.includes(p.author?.id));
  } else if (activeTab === "trending") {
    posts = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }`
);

fs.writeFileSync('frontend/pages/Dashboard.jsx', code);
console.log('Patched Dashboard.jsx');
