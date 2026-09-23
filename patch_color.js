import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const colorHelper = `const USER_COLORS = ['#ff8a65', '#ba68c8', '#4fc3f7', '#81c784', '#fff176', '#ffb74d', '#f06292', '#4dd0e1', '#aed581'];
const getUserColor = (userId) => {
    if (!userId) return USER_COLORS[0];
    let hash = 0;
    for (let i = 0; i < String(userId).length; i++) {
        hash = String(userId).charCodeAt(i) + ((hash << 5) - hash);
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};
`;

c = c.replace('export const Messages = ({ embeddedChatId }) => {', colorHelper + '\nexport const Messages = ({ embeddedChatId }) => {');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Injected getUserColor");
