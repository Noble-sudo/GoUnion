const fs = require('fs');
let content = fs.readFileSync('frontend/App.jsx', 'utf8');

// Replace Alumni with Teaky
content = content.replace('import { Alumni } from "./pages/Alumni";', 'import { Teaky } from "./pages/Teaky";\nimport { Onboarding } from "./pages/Onboarding";');
content = content.replace('_jsx(Route, { path: "/alumni", element: _jsx(PrivateRoute, { children: _jsx(Alumni, {}) }) })', '_jsx(Route, { path: "/teaky", element: _jsx(PrivateRoute, { children: _jsx(Teaky, {}) }) })');

// Add Onboarding before Dashboard
content = content.replace('_jsx(Route, { path: "/", element: isAuthenticated ? _jsx(PrivateRoute, { children: _jsx(Dashboard, {}) }) : _jsx(Landing, {}) })', '_jsx(Route, { path: "/onboarding", element: _jsx(PrivateRoute, { children: _jsx(Onboarding, {}) }) }), _jsx(Route, { path: "/", element: isAuthenticated ? _jsx(PrivateRoute, { children: _jsx(Dashboard, {}) }) : _jsx(Landing, {}) })');

fs.writeFileSync('frontend/App.jsx', content);
