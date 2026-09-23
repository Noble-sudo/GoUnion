import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

const targetLine = 'partner: { ...transformUser(partner), isGroup: !!partner.isGroup, onlineCount: partner.onlineCount || 0, isOnline: !!partner.isGroup || partner.isOnline },';
const replacementLine = 'partner: { ...transformUser(partner), isGroup: !!partner.isGroup, onlineCount: partner.onlineCount || 0, isOnline: !!partner.isGroup || (partner.is_online ?? partner.isOnline ?? transformUser(partner).isOnline) },';

c = c.replace(targetLine, replacementLine);

fs.writeFileSync('frontend/services/api.js', c);
console.log("Patched transformConversation isOnline bug");
