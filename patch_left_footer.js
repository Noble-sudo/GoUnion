import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetFooterStart = `<footer className="bg-[#0a0a0c]/95 border-t border-white/5 px-2 py-2 relative z-30 flex flex-col gap-2">`;
const newFooterStart = `{activeChat?.isLeft ? (
                                <div className="px-5 py-4 bg-[#111114] text-white/50 text-center text-sm border-t border-white/5 flex flex-col items-center justify-center h-[72px]">
                                    You are no longer a participant in this group.
                                </div>
                            ) : (
                            <footer className="bg-[#0a0a0c]/95 border-t border-white/5 px-2 py-2 relative z-30 flex flex-col gap-2">`;

// I also need to close it. The footer ends at `</footer>`
const targetFooterEnd = `</footer>`;
const newFooterEnd = `</footer>\n                            )}`;

// Because there might be other footers? Let's check how many <footer exists.
c = c.replace(targetFooterStart, newFooterStart);
// Replace the LAST </footer> which matches the main chat area
const lastFooterIdx = c.lastIndexOf('</footer>');
if (lastFooterIdx !== -1) {
    c = c.substring(0, lastFooterIdx) + newFooterEnd + c.substring(lastFooterIdx + 9);
}

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched footer to hide if left group");
