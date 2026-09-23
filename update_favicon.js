const fs = require('fs');
let c = fs.readFileSync('frontend/index.html', 'utf8');
c = c.replace('<link rel="icon" type="image/png" href="/favicon.png">', '<link rel="icon" type="image/svg+xml" href="/favicon.svg">');
c = c.replace('<title>GoUnion | The Student Network</title>', '<title>Reconnected</title>');
fs.writeFileSync('frontend/index.html', c);
console.log('Updated index.html');
