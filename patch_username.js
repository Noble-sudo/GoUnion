import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Inject the color helper at the top
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

if (!c.includes('getUserColor')) {
    c = c.replace('export const Messages = () => {', colorHelper + '\nexport const Messages = () => {');
}

// Remove username from inside bubble
const innerUsername = `                                                                    {!mine && activeChat?.partner?.isGroup && (
                                                                          <div className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-1">
                                                                              @{msg.sender?.username || msg.sender?.fullName || "member"}
                                                                          </div>
                                                                      )}`;

c = c.replace(innerUsername, '');

// Add username outside bubble
const targetCol = `<div className={\`flex flex-col gap-1 \${mine ? "items-end" : "items-start"}\`}>`;
const outerUsername = `<div className={\`flex flex-col gap-1 \${mine ? "items-end" : "items-start"}\`}>
                                                                {!mine && activeChat?.partner?.isGroup && (
                                                                    <div className="text-[11px] font-bold tracking-wide ml-1" style={{ color: getUserColor(msg.sender?.id) }}>
                                                                        {msg.sender?.fullName || msg.sender?.username || "Member"}
                                                                    </div>
                                                                )}`;

c = c.replace(targetCol, outerUsername);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Moved username and added random colors");
