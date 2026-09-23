const fs = require('fs');
let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
    /return \{\n\s*id: conversation\?\.id\?\.toString\(\),\n\s*partner:/,
    `return {
        id: conversation?.id?.toString(),
        participants: conversation.participants ? conversation.participants.map(transformUser) : [],
        partner:`
);

fs.writeFileSync('frontend/services/api.js', c);
console.log('Patched transformConversation to include participants');
