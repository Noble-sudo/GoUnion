import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'const fwdContent = `Forwarded from ${senderName}:\\n\\n${msgToForward.content || \'\'}${mediaStr ? \'\\n\' + mediaStr : \'\'}`;',
    'const fwdContent = `Forwarded:\\n\\n${msgToForward.content || \'\'}${mediaStr ? \'\\n\' + mediaStr : \'\'}`;'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Patched forwarded text");
