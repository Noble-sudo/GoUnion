const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

// I need to find the </Link> that comes before <Link to={targetPath}
c = c.replace(
    /<\/div>\n\s*<\/Link>\n\s*<Link to=\{targetPath\}/,
    '</div>\n                                  </Link>\n                                  )}\n                                  <Link to={targetPath}'
);

fs.writeFileSync('frontend/pages/Notifications.jsx', c);
console.log('Fixed syntax error in Notifications.jsx');
