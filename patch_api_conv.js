import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

const transformConversationRegex = /const transformConversation = \(conversation\) => \{[\s\S]*?const partner = conversation\.participants\?\.find\(\(p\) => String\(p\.id\) !== String\(currentUserId\)\) \|\|[\s\S]*?conversation\.participants\?\.\[0\] \|\|[\s\S]*?conversation\.partner \|\|[\s\S]*?\{ id: 0, username: 'Unknown', full_name: 'Unknown User' \};/m;

const newTransformConversation = `const transformConversation = (conversation) => {
    const currentUserId = authStorage.getItem('user_id');
    
    let partner;
    if (conversation.group) {
        partner = {
            id: conversation.group.id,
            username: conversation.group.name,
            full_name: conversation.group.name,
            profile_picture_url: conversation.group.cover_image,
            isGroup: true
        };
    } else {
        partner = conversation.participants?.find((p) => String(p.id) !== String(currentUserId)) ||
            conversation.participants?.[0] ||
            conversation.partner ||
            { id: 0, username: 'Unknown', full_name: 'Unknown User' };
    }`;

content = content.replace(transformConversationRegex, newTransformConversation);
fs.writeFileSync('frontend/services/api.js', content);
console.log('Updated transformConversation in api.js');
