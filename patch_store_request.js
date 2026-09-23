import fs from 'fs';

let content = fs.readFileSync('backend/src/store.js', 'utf8');

// Add has_requested to serializeGroup
content = content.replace(
  'is_joined: viewerId ? Boolean(await GroupMember.exists({ group_id: group.id, user_id: viewerId })) : false,',
  `is_joined: viewerId ? Boolean(await GroupMember.exists({ group_id: group.id, user_id: viewerId })) : false,\n    has_requested: viewerId ? Boolean(await models.GroupRequest.exists({ group_id: group.id, user_id: viewerId, status: 'pending' })) : false,`
);

// We need to import models.GroupRequest. wait, models is not imported as models. It imports specific ones:
// 'import { User, Follow, Post, Comment, PostView, Group, GroupMember, Notification, Message, Conversation, Story, StoryView, StoryLike } from './models.js';'
// Let's check imports
if (!content.includes('GroupRequest')) {
    content = content.replace(
      "import { User, Follow, Post, Comment, PostView, Group, GroupMember, Notification, Message, Conversation, Story, StoryView, StoryLike } from './models.js';",
      "import { User, Follow, Post, Comment, PostView, Group, GroupMember, GroupRequest, Notification, Message, Conversation, Story, StoryView, StoryLike } from './models.js';"
    );
}

content = content.replace(
  "has_requested: viewerId ? Boolean(await models.GroupRequest",
  "has_requested: viewerId ? Boolean(await GroupRequest"
);


fs.writeFileSync('backend/src/store.js', content);
console.log('Added has_requested to serializeGroup');
