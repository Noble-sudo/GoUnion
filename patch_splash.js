import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(/isGoto/g, 'isKonnect');
c = c.replace(/===\s*['"]\/goto['"]/g, "=== '/konnect'");

const oldSplash = `const AppStartupSplash = () => {
    return (_jsx("div", { className: "min-h-screen w-full bg-[#030303] text-white flex items-center justify-center px-6", children: _jsxs("div", { className: "glass-panel rounded-3xl p-10 w-full max-w-sm text-center", children: [_jsx("div", { className: "mx-auto w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-serif font-black text-3xl", children: "G" }), _jsx("h1", { className: "mt-5 font-serif text-3xl tracking-tight", children: "GoUnion" }), _jsx("p", { className: "mt-3 text-sm text-zinc-300 leading-relaxed", children: "Loading" }), _jsx("p", { className: "mt-4 text-2xl text-primary animate-pulse", "aria-hidden": "true", children: "." })] }) }));
};`;

const newSplash = `const AppStartupSplash = () => {
    return (_jsx("div", { className: "min-h-screen w-full bg-[#030303] text-white flex flex-col items-center justify-center px-6", children: _jsxs("div", { className: "w-full max-w-sm flex flex-col items-center justify-center text-center", children: [_jsx("div", { className: "mx-auto flex items-center justify-center font-black text-6xl text-white mb-2", children: "R" }), _jsx("h1", { className: "text-sm font-black uppercase tracking-[0.4em] text-white/60 ml-2", children: "Reconnected" }), _jsxs("div", { className: "mt-8 flex justify-center gap-1.5", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.2s]" }), _jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.1s]" }), _jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" })] })] }) }));
};`;

c = c.replace(oldSplash, newSplash);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Restored Reconnected layout and splash screen');
