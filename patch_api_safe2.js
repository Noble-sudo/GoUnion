import fs from 'fs';

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(/p\.id/g, 'p?.id');
c = c.replace(/post\.likes\?\.some\(\(l\) => l\.id/g, 'post.likes?.some((l) => l?.id');
c = c.replace(/res\.data\.find\(\(post\) => String\(post\.id\)/g, 'res.data.find((post) => String(post?.id)');
c = c.replace(/c\.participants\?\.some\(\(p\) => String\(p\.id\)/g, 'c.participants?.some((p) => String(p?.id)');

fs.writeFileSync('frontend/services/api.js', c);
console.log("Patched api.js with more optional chaining");
