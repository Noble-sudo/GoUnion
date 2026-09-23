import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

// Wrap the whole return in a try-catch error boundary just for this component
const target = `return (
        <div className={embeddedChatId ? "h-[75vh] min-h-[500px] w-full bg-transparent text-white overflow-hidden" : "h-[100dvh] w-full bg-[#030303] text-white overflow-hidden"}>`;

const replacement = `
    try {
        return (
            <div className={embeddedChatId ? "h-[75vh] min-h-[500px] w-full bg-transparent text-white overflow-hidden" : "h-[100dvh] w-full bg-[#030303] text-white overflow-hidden"}>`;

const endTarget = `        </div>
    );
};`;

const endReplacement = `        </div>
        );
    } catch (err) {
        return (
            <div className="p-10 bg-black text-red-500 font-mono text-xs w-full h-screen overflow-auto">
                <h1 className="text-xl font-bold mb-4">Messages Component Crashed</h1>
                <pre>{err.stack || err.message || String(err)}</pre>
            </div>
        );
    }
};`;

if (c.includes(target) && c.includes(endTarget)) {
    c = c.replace(target, replacement);
    c = c.replace(endTarget, endReplacement);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Injected error boundary into Messages.jsx");
} else {
    console.log("Failed to inject error boundary");
}
