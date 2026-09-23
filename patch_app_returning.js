import fs from 'fs';

let content = fs.readFileSync('frontend/App.jsx', 'utf8');

content = content.replace(
  '_jsx(Route, { path: "/", element: isAuthenticated ? _jsx(AppLayout, { children: _jsx(Dashboard, {}) }) : _jsx(Landing, {}) })',
  '_jsx(Route, { path: "/", element: isAuthenticated ? _jsx(AppLayout, { children: _jsx(Dashboard, {}) }) : (localStorage.getItem("returning_user") === "true" ? _jsx(Navigate, { to: "/login" }) : _jsx(Landing, {})) })'
);

fs.writeFileSync('frontend/App.jsx', content);
console.log('App.jsx patched for returning user redirect');
