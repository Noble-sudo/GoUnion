const fs = require('fs');
let content = fs.readFileSync('frontend/App.jsx', 'utf8');

content = content.replace('return _jsx(Navigate, { to: (isPwa || isReturningUser) ? "/login" : "/download", replace: true });', 'return _jsx(Navigate, { to: "/", replace: true });');

fs.writeFileSync('frontend/App.jsx', content);
