import fs from 'fs';

// Patch posts.js
let postsSrc = fs.readFileSync('backend/src/routes/posts.js', 'utf8');
postsSrc = postsSrc.replace(/import \{ addNotification, publicUser, serializePost \} from '\.\.\/store\.js';/, "import { addNotification, publicUser, serializePost, processMentions } from '../store.js';");
// After post save:
postsSrc = postsSrc.replace(/await post\.save\(\);/, "await post.save(); await processMentions(post.content, req.user.id, { post_id: post.id });");
fs.writeFileSync('backend/src/routes/posts.js', postsSrc);

// Patch groups.js
let groupsSrc = fs.readFileSync('backend/src/routes/groups.js', 'utf8');
groupsSrc = groupsSrc.replace(/import \{ addNotification, serializeGroup \} from '\.\.\/store\.js';/, "import { addNotification, serializeGroup, processMentions } from '../store.js';");
groupsSrc = groupsSrc.replace(/await post\.save\(\);/, "await post.save(); await processMentions(post.content, req.user.id, { post_id: post.id, group_id: group.id });");
fs.writeFileSync('backend/src/routes/groups.js', groupsSrc);

// Patch conversations.js
let convSrc = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');
convSrc = convSrc.replace(/import \{ addNotification, serializeConversation, serializeMessage \} from '\.\.\/store\.js';/, "import { addNotification, serializeConversation, serializeMessage, processMentions } from '../store.js';");
convSrc = convSrc.replace(/await message\.save\(\);/, "await message.save(); await processMentions(message.content, req.user.id, { group_id: conversation.group_id });");
fs.writeFileSync('backend/src/routes/conversations.js', convSrc);

console.log('Patched routes for mentions');
