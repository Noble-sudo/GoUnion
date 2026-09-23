const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const lines = c.split('\n');
let lastExportIndex = -1;

for(let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '};') {
        lastExportIndex = i;
        break;
    }
}

if (lastExportIndex !== -1 && lastExportIndex < lines.length - 1) {
    c = lines.slice(0, lastExportIndex + 1).join('\n');
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log('Removed trailing garbage correctly!');
} else {
    console.log('No trailing garbage found or failed to parse.');
}
