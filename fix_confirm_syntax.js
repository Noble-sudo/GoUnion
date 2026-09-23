const fs = require('fs');

let c = fs.readFileSync('frontend/components/ui/ConfirmProvider.jsx', 'utf8');

c = c.replace(/className=\{\\\`/g, 'className={`');
c = c.replace(/\\\`\}/g, '`}');

fs.writeFileSync('frontend/components/ui/ConfirmProvider.jsx', c);
console.log('Fixed ConfirmProvider');
