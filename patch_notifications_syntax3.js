const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

c = c.replace('</Link>\n                                <Link to={targetPath} onClick={(e) => { markOneReadMutation.mutate', '</Link>\n                                )}\n                                <Link to={targetPath} onClick={(e) => { markOneReadMutation.mutate');
c = c.replace('</Link>\r\n                                <Link to={targetPath} onClick={(e) => { markOneReadMutation.mutate', '</Link>\r\n                                )}\r\n                                <Link to={targetPath} onClick={(e) => { markOneReadMutation.mutate');

fs.writeFileSync('frontend/pages/Notifications.jsx', c);
console.log('Fixed ternary properly with strings');
