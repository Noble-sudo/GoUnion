const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

c = c.replace(
    /<\/Link>\n\s*<Link to=\{targetPath\} onClick=\{\(e\) =>/g,
    '</Link>\n                                )}\n                                <Link to={targetPath} onClick={(e) =>'
);

fs.writeFileSync('frontend/pages/Notifications.jsx', c);
console.log('Fixed ternary properly');
