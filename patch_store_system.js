import fs from 'fs';

let c = fs.readFileSync('backend/src/store.js', 'utf8');

const updatedPublicUser = `
export const publicUser = async (userOrId, viewerId = null) => {
  if (userOrId === 'system' || userOrId === 'reconnected_admin') {
    return {
      id: 'system',
      username: 'reconnected_admin',
      email: 'admin@reconnected.com',
      role: 'admin',
      is_online: true,
      profile: {
        full_name: 'Reconnected Admin',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=ReconnectedAdmin',
        bio: 'Official Reconnected Communications',
        university: 'Reconnected Platform',
      },
      followers: 0,
      following: 0,
      total_likes: 0,
      is_following: false
    };
  }
  const user = typeof userOrId === 'string' ? await User.findOne({ id: userOrId }) : userOrId;
`;

c = c.replace(/export const publicUser = async \(userOrId, viewerId = null\) => \{\s*const user = typeof userOrId === 'string' \? await User\.findOne\(\{ id: userOrId \}\) : userOrId;/, updatedPublicUser);

fs.writeFileSync('backend/src/store.js', c);
console.log('Patched store.js to support system user');
