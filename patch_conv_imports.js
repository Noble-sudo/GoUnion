import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

c = c.replace(
    "import { Conversation, Message } from '../models.js';",
    "import { Conversation, Message, User } from '../models.js';"
);

fs.writeFileSync('backend/src/routes/conversations.js', c);
console.log("Added User import to conversations.js!");
