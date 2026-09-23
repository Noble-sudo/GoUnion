const fs = require('fs');
let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
    /return \{\n\s*id: conversation\?\.id\?\.toString\(\),/,
    `return {
        id: conversation?.id?.toString(),
        participants: conversation.participants ? conversation.participants.map(transformUser) : [],`
);

fs.writeFileSync('frontend/services/api.js', c);
console.log('Patched participants in transformConversation');
