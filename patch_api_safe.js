import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(/conversation\.id\.toString\(\)/g, 'conversation?.id?.toString()');
c = c.replace(/conversation\.group\.id/g, 'conversation?.group?.id');
c = c.replace(/post\.id\.toString\(\)/g, 'post?.id?.toString()');
c = c.replace(/m\.id\.toString\(\)/g, 'm?.id?.toString()');
c = c.replace(/g\.id\.toString\(\)/g, 'g?.id?.toString()');
c = c.replace(/s\.id\.toString\(\)/g, 's?.id?.toString()');

// Write back
fs.writeFileSync('frontend/services/api.js', c);
console.log("Patched api.js with optional chaining");
