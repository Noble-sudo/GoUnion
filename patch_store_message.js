import fs from 'fs';

let content = fs.readFileSync('backend/src/store.js', 'utf8');

const regex = /export const serializeMessage = async \(messageOrDoc\) => \{\r?\n  const message = toPlain\(messageOrDoc\);\r?\n  return \{\r?\n    \.\.\.message,\r?\n    sender: message\.sender_id \? await publicUser\(message\.sender_id\) : null,\r?\n  \};\r?\n\};/;

const replacement = `export const serializeMessage = async (messageOrDoc) => {
  const message = toPlain(messageOrDoc);
  return {
    ...message,
    sender: message.sender_id ? await publicUser(message.sender_id) : null,
    seen_by_users: await Promise.all((message.seen_by || []).map(async (s) => ({
      user: await publicUser(s.user_id),
      seen_at: s.seen_at
    }))),
  };
};`;

content = content.replace(regex, replacement);

fs.writeFileSync('backend/src/store.js', content);
console.log("Patched serializeMessage for seen_by_users!");
