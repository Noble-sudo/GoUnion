import fs from 'fs';

let code = fs.readFileSync('frontend/App.jsx', 'utf8');
code = code.replace(
  /_jsx\("div", \{ className: "mx-auto w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-serif font-black text-3xl", children: "G" \}\)/g,
  `_jsx("div", { className: "mx-auto w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black text-3xl", children: "R" })`
);
code = code.replace(
  /_jsx\("h1", \{ className: "mt-5 font-serif text-3xl tracking-tight", children: "GoUnion" \}\)/g,
  `_jsx("h1", { className: "mt-5 text-3xl font-black uppercase tracking-[0.18em] text-white", children: "Reconnected" })`
);
code = code.replace(
  /_jsx\("p", \{ className: "mt-4 text-2xl text-primary animate-pulse", "aria-hidden": "true", children: "\." \}\)/g,
  `_jsxs("div", { className: "mt-6 flex justify-center gap-1.5", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.2s]" }), _jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.1s]" }), _jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white/70 animate-bounce" })] })`
);
// Remove the 'Loading' text since we added dots? The user said "reconnected with three loading dots"
code = code.replace(
  /_jsx\("p", \{ className: "mt-3 text-sm text-zinc-300 leading-relaxed", children: "Loading" \}\), /g,
  ''
);

fs.writeFileSync('frontend/App.jsx', code);
console.log('Fixed Loading State');
