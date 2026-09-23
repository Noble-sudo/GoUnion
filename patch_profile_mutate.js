import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

// Fix toggleFollowMutation to take explicit action string to avoid closure staleness
content = content.replace(
  'mutationFn: () => isFollowingProfile ? api.profiles.unfollow(user.id) : api.profiles.follow(user.id),',
  'mutationFn: (action) => action === "unfollow" ? api.profiles.unfollow(user.id) : api.profiles.follow(user.id),'
);

// Update main button
content = content.replace(
  /onClick=\{\(\) => \{\s*if \(isFollowingProfile\) \{\s*setShowDisconnectConfirm\(true\);\s*\} else \{\s*toggleFollowMutation\.mutate\(\);\s*\}\s*\}\}/,
  'onClick={() => { if (isFollowingProfile) { setShowDisconnectConfirm(true); } else { toggleFollowMutation.mutate("follow"); } }}'
);

// Update modal disconnect button
content = content.replace(
  'onClick={() => { setShowDisconnectConfirm(false); toggleFollowMutation.mutate(); }}',
  'onClick={() => { setShowDisconnectConfirm(false); toggleFollowMutation.mutate("unfollow"); }}'
);

fs.writeFileSync('frontend/pages/Profile.jsx', content);
console.log('Fixed useMutation closure issue');
