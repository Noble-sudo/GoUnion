const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const regex = /onClick=\{\(\) => document\.getElementById\(\`msg-\$\{repliedMsg\.id\}\`\)\?\.scrollIntoView\(\{behavior: 'smooth', block: 'center'\}\)\}/g;
const replace = `onClick={() => { document.getElementById(\`msg-\${repliedMsg.id}\`)?.scrollIntoView({behavior: 'smooth', block: 'center'}); setHighlightedMsgId(repliedMsg.id); setTimeout(() => setHighlightedMsgId(null), 2000); }}`;

c = c.replace(regex, replace);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Added reply highlighting logic');
