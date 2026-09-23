import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

// Fix isFollowingProfile logic to use is_following
content = content.replace(
  'const isFollowingProfile = followers.some(f => String(f.id) === String(currentUser?.id)) || Boolean(user?.isFollowing);',
  'const isFollowingProfile = followers.some(f => String(f.id) === String(currentUser?.id)) || Boolean(user?.is_following) || Boolean(user?.isFollowing);'
);

content = content.replace(
  'return { ...old, isFollowing: !isFollowingProfile };',
  'return { ...old, isFollowing: !isFollowingProfile, is_following: !isFollowingProfile };'
);

fs.writeFileSync('frontend/pages/Profile.jsx', content);
console.log('Fixed isFollowing property bug');
