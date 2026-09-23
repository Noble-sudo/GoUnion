import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');
let lines = c.split('\n');

const firstInfoReplacement = `{mine && (
                                                                                    <button onClick={() => { setMsgInfoModal(msg); setActiveMessageMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg w-full text-left">
                                                                                        <Info size={14} /> Message Info
                                                                                    </button>
                                                                                )}`;

const secondInfoReplacement = `{mine && (
                                                                        <button onClick={() => setMsgInfoModal(msg)} className="hover:text-white transition-colors flex items-center gap-1" title="Message Info">
                                                                            <Info size={12} /> <span className="hidden sm:inline">Info</span>
                                                                        </button>
                                                                    )}`;

// Replace 802 to 806
const i2 = lines.findIndex((l, idx) => idx > 700 && l.includes('{navigator.share && ('));
if (i2 !== -1) {
    lines.splice(i2, 5, secondInfoReplacement);
}

// Replace 688 to 692
const i1 = lines.findIndex((l, idx) => idx > 600 && idx < 700 && l.includes('{navigator.share && ('));
if (i1 !== -1) {
    lines.splice(i1, 5, firstInfoReplacement);
}

fs.writeFileSync('frontend/pages/Messages.jsx', lines.join('\n'));
console.log("Successfully replaced both Share buttons with Info buttons");
