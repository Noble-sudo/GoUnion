import fs from 'fs';

let c = fs.readFileSync('frontend/App.jsx', 'utf8');

c = c.replace(
    /_jsx\(Route, \{ path: "\/alumni", element: _jsx\(PrivateRoute, \{ children: _jsx\(Alumni, \{\}\) \}\) \}\), /g,
    ''
);

c = c.replace(
    /_jsx\(Route, \{ path: "\/goto", element: _jsx\(PrivateRoute, \{ children: _jsx\(Goto, \{\}\) \}\) \}\)/g,
    '_jsx(Route, { path: "/konnect", element: _jsx(PrivateRoute, { children: _jsx(Konnect, {}) }) }), _jsx(Route, { path: "/teaky", element: _jsx(PrivateRoute, { children: _jsx(Teaky, {}) }) })'
);

fs.writeFileSync('frontend/App.jsx', c);
console.log('Fixed compiled routes');
