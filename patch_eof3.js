const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const endToken = '    );\n};\n                        <div className="relative">';
const idx = c.indexOf(endToken);
if (idx !== -1) {
    c = c.substring(0, idx + 8); // Include the `};\n`
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log('Removed garbage using precise indexOf!');
} else {
    // try removing just the last lines manually via split
    const lines = c.split('\\n');
    let endIndex = -1;
    for(let i=0; i<lines.length; i++) {
        if (lines[i].trim() === '};') {
            endIndex = i;
        }
    }
    if (endIndex !== -1 && endIndex < lines.length - 1) {
        c = lines.slice(0, endIndex + 1).join('\\n');
        fs.writeFileSync('frontend/pages/Messages.jsx', c);
        console.log('Removed garbage via lines splitting');
    }
}
