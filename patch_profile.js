const fs = require('fs');

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

// Render verification status badge next to Name
content = content.replace(
  /<h1 className="font-serif text-3xl font-bold text-white">\{user\.fullName\}<\/h1>/,
  `<div className="flex items-center gap-2">
    <h1 className="font-serif text-3xl font-bold text-white">{user.fullName}</h1>
    {user.verification_status === 'VERIFIED' && (
      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500/20 text-blue-400" title="Verified Student">
        <Check size={14} strokeWidth={3} />
      </span>
    )}
    {user.verification_status === 'LEGACY_UNVERIFIED' && (
      <span className="flex items-center justify-center px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-[10px] font-bold text-yellow-500 uppercase tracking-wider" title="Legacy User (Unverified)">
        Legacy
      </span>
    )}
  </div>`
);

fs.writeFileSync('frontend/pages/Profile.jsx', content);
console.log('Profile.jsx patched.');
