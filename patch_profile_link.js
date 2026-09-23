import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Profile.jsx', 'utf8');

const targetLink = '<Link to={`/messages/${user.id}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10">';
const newLink = '<Link to={`/messages?user=${user.id}&name=${encodeURIComponent(user.fullName || user.username)}&avatar=${encodeURIComponent(user.avatarUrl)}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10">';

c = c.replace(targetLink, newLink);

fs.writeFileSync('frontend/pages/Profile.jsx', c);
console.log("Patched Profile Message Link");
