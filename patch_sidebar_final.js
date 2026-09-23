import fs from 'fs';

// 1. Sidebar.jsx
let sidebar = fs.readFileSync('frontend/components/layout/Sidebar.jsx', 'utf8');

// The exact string to remove from Sidebar
const sidebarStr = `<div className="flex items-center gap-2 rounded-lg border border-[rgba(199,249,79,0.15)] bg-[rgba(199,249,79,0.05)] px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-[var(--rc-go)] animate-pulse" />
          <span className="truncate text-xs font-bold text-[var(--rc-go)]">{user?.university || "Campus ecosystem"}</span>
        </div>`;
sidebar = sidebar.replace(sidebarStr, '');
fs.writeFileSync('frontend/components/layout/Sidebar.jsx', sidebar);

// 2. TopNav.jsx (it's already compiled somehow? Let's check the source in src!)
// Wait, TopNav.jsx I dumped was compiled? No, TopNav.jsx in the dump had `_jsx`!
// Ah, `patch_topnav.js` probably wrote the compiled code by accident?
