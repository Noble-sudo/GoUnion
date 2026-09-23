import fs from 'fs';

let c = fs.readFileSync('backend/src/store.js', 'utf8');

// I'll add a helper function in store.js to parse mentions and send notifications
const extractMentionsHelper = `
export const processMentions = async (content, senderId, targetInfo) => {
  if (!content) return;
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
  let match;
  const usernames = new Set();
  while ((match = mentionRegex.exec(content)) !== null) {
    usernames.add(match[1]);
  }
  
  if (usernames.size > 0) {
    const User = (await import('./models.js')).User;
    const users = await User.find({ username: { $in: Array.from(usernames) } }).select('id').lean();
    for (const u of users) {
      if (u.id !== senderId) {
        await addNotification({
          user_id: u.id,
          sender_id: senderId,
          type: 'mention',
          ...targetInfo
        });
      }
    }
  }
};
`;

c = c.replace(/export const serializePost/, extractMentionsHelper + '\nexport const serializePost');
fs.writeFileSync('backend/src/store.js', c);
console.log('Added processMentions helper');
