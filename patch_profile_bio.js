import fs from 'fs';

let profile = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

// Remove university badge from Profile
profile = profile.replace(
  '<span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">{user.university || "University"}</span>',
  ''
);

// Add bio label
profile = profile.replace(
  '{/* Bio */}\n        {user.bio && (\n          <div className="mb-8 max-w-2xl text-sm leading-relaxed text-white/70">\n            {user.bio}\n          </div>\n        )}',
  '{/* Bio */}\n        <div className="mb-8 max-w-2xl">\n          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Bio</p>\n          <div className="text-sm leading-relaxed text-white/70">\n            {user.bio || (isOwnProfile ? "Write something about yourself in your settings." : "No bio provided yet.")}\n          </div>\n        </div>'
);

fs.writeFileSync('frontend/pages/Profile.jsx', profile);
