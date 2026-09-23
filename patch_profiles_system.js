import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/profiles.js', 'utf8');

c = c.replace(
    /const user = await User\.findOne\(\{ username: new RegExp\(\`\^\\\$\{req\.params\.username\}\\\$\`, 'i'\) \}\);/,
    `if (req.params.username.toLowerCase() === 'reconnected_admin') {
      return res.json(await (await import('../store.js')).publicUser('system', req.user.id));
    }
    const user = await User.findOne({ username: new RegExp(\`^\${req.params.username}$\`, 'i') });`
);

fs.writeFileSync('backend/src/routes/profiles.js', c);
console.log('Patched profiles.js for reconnected_admin');
