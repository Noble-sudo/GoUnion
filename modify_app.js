const fs = require('fs');
let content = fs.readFileSync('frontend/App.jsx', 'utf8');

content = content.replace('import { Dashboard } from "./pages/Dashboard";', 'import { Dashboard } from "./pages/Dashboard";\nimport { Landing } from "./pages/Landing";');
content = content.replace('const PUBLIC_ROUTES = [\n        "/login",', 'const PUBLIC_ROUTES = [\n        "/",\n        "/login",');
content = content.replace('_jsx(Route, { path: "/", element: _jsx(PrivateRoute, { children: _jsx(Dashboard, {}) }) })', '_jsx(Route, { path: "/", element: isAuthenticated ? _jsx(PrivateRoute, { children: _jsx(Dashboard, {}) }) : _jsx(Landing, {}) })');

fs.writeFileSync('frontend/App.jsx', content);
