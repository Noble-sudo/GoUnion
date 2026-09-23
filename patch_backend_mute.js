import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

c = c.replace(
    /if \(!req\.user\.muted_conversations\.includes\(targetId\)\) \{\s*req\.user\.muted_conversations\.push\(targetId\);\s*await req\.user\.save\(\);\s*\}/,
    `await req.user.updateOne({ $addToSet: { muted_conversations: targetId } });`
);

c = c.replace(
    /req\.user\.muted_conversations = req\.user\.muted_conversations\.filter\(id => id !== targetId\);\s*await req\.user\.save\(\);/,
    `await req.user.updateOne({ $pull: { muted_conversations: targetId } });`
);

fs.writeFileSync('backend/src/routes/conversations.js', c);
console.log('Patched backend to use updateOne for muting');
