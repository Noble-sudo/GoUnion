import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetStr = `<button onClick={() => setIsSuggestionsOpen(true)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center">
                            <MoreVertical size={20} />
                        </button>`;

const newStr = `<button onClick={() => setIsSuggestionsOpen(true)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center group" title="New Chat">
                            <MessageSquarePlus size={20} className="group-hover:scale-110 transition-transform" />
                        </button>`;

if (c.includes(targetStr)) {
    c = c.replace(targetStr, newStr);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Patched New Chat button icon");
} else {
    console.log("Target string not found in Messages.jsx!");
}
