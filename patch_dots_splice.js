import fs from 'fs';

let lines = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('setIsSuggestionsOpen(true)'));
lines.splice(start, 3, 
    '                        <button onClick={() => setIsSuggestionsOpen(true)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center group" title="New Chat">',
    '                            <MessageSquarePlus size={20} className="group-hover:scale-110 transition-transform" />',
    '                        </button>'
);
fs.writeFileSync('frontend/pages/Messages.jsx', lines.join('\n'));
console.log('Patched');
