import fs from 'fs';

let content = fs.readFileSync('backend/src/store.js', 'utf8');

// We need to import Group in store.js if it's not imported.
if (!content.includes('Group,')) {
    content = content.replace('GroupMember,', 'Group,\n  GroupMember,');
}

const serializeConversationRegex = /export const serializeConversation = async \(conversationOrDoc, viewerId = null\) => \{[\s\S]*?return \{[\s\S]*?unread_count: unreadCount,\n  \};\n\};/m;

const newSerializeConversation = `export const serializeConversation = async (conversationOrDoc, viewerId = null) => {
  const conversation = toPlain(conversationOrDoc);
  const messages = await Message.find({ conversation_id: conversation.id }).sort({ created_at: 1 });
  
  let unreadCount = 0;
  if (viewerId) {
    unreadCount = await Message.countDocuments({
      conversation_id: conversation.id,
      sender_id: { $ne: viewerId },
      is_read: false,
    });
  }

  let groupData = null;
  if (conversation.group_id) {
    const group = await Group.findOne({ id: conversation.group_id });
    if (group) {
      groupData = await serializeGroup(group, viewerId);
    }
  }

  return {
    ...conversation,
    participants: await Promise.all((conversation.participant_ids || []).map((id) => publicUser(id, viewerId))),
    messages: await Promise.all(messages.map(serializeMessage)),
    unread_count: unreadCount,
    group: groupData
  };
};`;

content = content.replace(serializeConversationRegex, newSerializeConversation);
fs.writeFileSync('backend/src/store.js', content);
console.log('Updated serializeConversation to include groupData');
