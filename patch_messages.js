const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(/export const Messages = \(\) => \{/, 'export const Messages = ({ embeddedChatId }) => {');

c = c.replace(
    /const \[selectedChatId, setSelectedChatId\] = useState\(null\);/,
    `const [selectedChatId, setSelectedChatId] = useState(embeddedChatId || null);
    React.useEffect(() => {
        if (embeddedChatId) setSelectedChatId(embeddedChatId);
    }, [embeddedChatId]);`
);

c = c.replace(
    /className=\{\`w-full md:w-\[390px\] md:min-w-\[390px\] bg-\[#050505\]\/95 border-r border-white\/10 flex-col \$\{selectedChatId \? "hidden md:flex" : "flex"\}\`\}/,
    'className={`w-full md:w-[390px] md:min-w-[390px] bg-[#050505]/95 border-r border-white/10 flex-col ${selectedChatId ? "hidden md:flex" : "flex"} ${embeddedChatId ? "!hidden" : ""}`}'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched Messages.jsx for embeddedChatId');
