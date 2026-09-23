import fs from 'fs';

// 1. Fix store.js logout
let storeContent = fs.readFileSync('frontend/store.js', 'utf8');
storeContent = storeContent.replace(
  "localStorage.setItem('returning_user', 'true');",
  "window.location.href = '/login';"
);
fs.writeFileSync('frontend/store.js', storeContent);

// 2. Fix App.jsx
let appContent = fs.readFileSync('frontend/App.jsx', 'utf8');
appContent = appContent.replace(
  '(localStorage.getItem("returning_user") === "true" ? _jsx(Navigate, { to: "/login" }) : _jsx(Landing, {}))',
  '_jsx(Landing, {})'
);
fs.writeFileSync('frontend/App.jsx', appContent);

console.log('Fixed signout and landing page logic');
