const fs = require('fs');
let c = fs.readFileSync('frontend/App.jsx', 'utf8');

if (!c.includes('import { Landing }')) {
    c = c.replace(/import \{ Dashboard \} from "\.\/pages\/Dashboard"\;/, 'import { Dashboard } from "./pages/Dashboard";\nimport { Landing } from "./pages/Landing";');
}

c = c.replace(
    /_jsx\(Route, \{ path: "\/", element: _jsx\(PrivateRoute, \{ children: _jsx\(Dashboard, \{\}\) \}\) \}\)/g,
    '_jsx(Route, { path: "/", element: isAuthenticated ? _jsx(PrivateRoute, { children: _jsx(Dashboard, {}) }) : _jsx(Landing, {}) })'
);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Patched App.jsx for Landing');
