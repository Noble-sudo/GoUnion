import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

const targetOnline = `                        if (String(chat.partner?.id) === userId) {
                            return { ...chat, partner: { ...chat.partner, isOnline: true, lastSeen: null } };
                        }
                        return chat;`;
                        
const replaceOnline = `                        if (String(chat.partner?.id) === userId) {
                            return { ...chat, partner: { ...chat.partner, isOnline: true, lastSeen: null } };
                        }
                        if (chat.partner?.isGroup && chat.participants) {
                            const updatedParticipants = chat.participants.map(p => String(p.id) === userId ? { ...p, isOnline: true } : p);
                            const onlineCount = updatedParticipants.filter(p => p.isOnline).length;
                            return { ...chat, participants: updatedParticipants, partner: { ...chat.partner, onlineCount } };
                        }
                        return chat;`;

const targetOffline = `                        if (String(chat.partner?.id) === userId) {
                            return { ...chat, partner: { ...chat.partner, isOnline: false, lastSeen } };
                        }
                        return chat;`;
                        
const replaceOffline = `                        if (String(chat.partner?.id) === userId) {
                            return { ...chat, partner: { ...chat.partner, isOnline: false, lastSeen } };
                        }
                        if (chat.partner?.isGroup && chat.participants) {
                            const updatedParticipants = chat.participants.map(p => String(p.id) === userId ? { ...p, isOnline: false } : p);
                            const onlineCount = updatedParticipants.filter(p => p.isOnline).length;
                            return { ...chat, participants: updatedParticipants, partner: { ...chat.partner, onlineCount } };
                        }
                        return chat;`;

c = c.replace(targetOnline, replaceOnline);
c = c.replace(targetOffline, replaceOffline);

fs.writeFileSync('frontend/App.jsx', c);
console.log("Patched App.jsx to handle group online counts");
