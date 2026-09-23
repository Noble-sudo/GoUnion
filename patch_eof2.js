const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const targetStr = `        </div>\n    );\n};\n                        <div className="relative">\n                            <button onClick={() => setIsChatListMenuOpen(!isChatListMenuOpen)} className="h-10 w-10 rounded-xl text-white/50 hover:text-white hover:bg-white/5 flex items-center justify-center">`;

if (c.includes('};\n                        <div className="relative">')) {
    c = c.substring(0, c.indexOf('};\n                        <div className="relative">') + 2);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log('Removed garbage at EOF safely!');
} else {
    console.log('Garbage at EOF not found');
}
