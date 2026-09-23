const fs = require('fs');

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(/setMsgInfoModal/g, 'setInfoMessage');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Patched setMsgInfoModal to setInfoMessage');
