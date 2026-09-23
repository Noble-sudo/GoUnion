const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /\{repliedMsg && \(\n\s*<div className=\{`mb-2 p-2 rounded-xl border-l-2/,
    `{msg.isForwarded && (
                                                                        <div className={\`flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider mb-2 px-1 \${mine ? "text-black/50" : "text-white/40"}\`}>
                                                                            <Share size={10} /> Forwarded
                                                                        </div>
                                                                    )}
                                                                    {repliedMsg && (
                                                                        <div className={\`mb-2 p-2 rounded-xl border-l-2`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched forwarded label');
