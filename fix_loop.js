import fs from 'fs';

// 1. Revert store.js
let storeContent = fs.readFileSync('frontend/store.js', 'utf8');
storeContent = storeContent.replace(
  "window.location.href = '/login';",
  ""
);
fs.writeFileSync('frontend/store.js', storeContent);

// 2. Fix App.jsx
let appContent = fs.readFileSync('frontend/App.jsx', 'utf8');
appContent = appContent.replace(
  'return _jsx(Navigate, { to: "/", replace: true });\n    }',
  'return _jsx(Navigate, { to: "/login", replace: true });\n    }'
);
appContent = appContent.replace(
  'return _jsx(Navigate, { to: "/", replace: true });\r\n    }',
  'return _jsx(Navigate, { to: "/login", replace: true });\r\n    }'
);

fs.writeFileSync('frontend/App.jsx', appContent);

console.log('Fixed infinite redirect loop and signout routing');
