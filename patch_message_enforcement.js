import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

const targetStr = `if (!hasParticipant(conversation, req.user.id)) throw forbidden('You cannot message this conversation.');`;
const enforcementLogic = `if (!hasParticipant(conversation, req.user.id)) throw forbidden('You cannot message this conversation.');
    
    const partnerId = conversation.participant_ids.find(id => id !== req.user.id);
    if (partnerId) {
        const partner = await User.findOne({ id: partnerId });
        if (partner && partner.blocked_users && partner.blocked_users.includes(req.user.id)) {
            throw new HttpError(403, 'You cannot send a message to this user.');
        }
        if (req.user.blocked_users && req.user.blocked_users.includes(partnerId)) {
            throw new HttpError(403, 'You must unblock this user to send a message.');
        }
    }`;

c = c.replace(targetStr, enforcementLogic);

fs.writeFileSync('backend/src/routes/conversations.js', c);
console.log("Added block enforcement to sending messages!");
