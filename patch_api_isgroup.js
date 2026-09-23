import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

// We need to modify transformConversation's return statement.
// Find: partner: transformUser(partner),
// Replace with: partner: { ...transformUser(partner), isGroup: !!partner.isGroup, onlineCount: partner.onlineCount || 0 },

content = content.replace(/partner: transformUser\(partner\),/, `partner: { ...transformUser(partner), isGroup: !!partner.isGroup, onlineCount: partner.onlineCount || 0 },`);

// And we need to add onlineCount to the partner assignment for groups
// Find:
//         partner = {
//             id: conversation.group.id,
//             username: conversation.group.name,
//             full_name: conversation.group.name,
//             profile_picture_url: conversation.group.cover_image,
//             isGroup: true
//         };

const groupPartnerRegex = /        partner = \{\r?\n              id: conversation\.group\.id,\r?\n              username: conversation\.group\.name,\r?\n              full_name: conversation\.group\.name,\r?\n              profile_picture_url: conversation\.group\.cover_image,\r?\n              isGroup: true\r?\n          \};/;

const replacement = `        partner = {
            id: conversation.group.id,
            username: conversation.group.name,
            full_name: conversation.group.name,
            profile_picture_url: conversation.group.cover_image,
            isGroup: true,
            onlineCount: conversation.participants ? conversation.participants.filter(p => p.is_online || p.isOnline).length : 0
        };`;

content = content.replace(groupPartnerRegex, replacement);

fs.writeFileSync('frontend/services/api.js', content);
console.log("Patched transformConversation in api.js!");
