const fs = require('fs');
let content = fs.readFileSync('frontend/App.jsx', 'utf8');

// 1. Add noLayout to PrivateRoute
content = content.replace(
  /const PrivateRoute = \(\{ children \}\) => \{/,
  `const PrivateRoute = ({ children, noLayout }) => {`
);

content = content.replace(
  /return <AppLayout>\{children\}<\/AppLayout>;/,
  `if (noLayout) return <>{children}</>;\n  return <AppLayout>{children}</AppLayout>;`
);

// 2. Pass noLayout to AdminPanel
content = content.replace(
  /<Route path="\/admin" element=\{<PrivateRoute><AdminPanel \/><\/PrivateRoute>\} \/>/,
  `<Route path="/admin" element={<PrivateRoute noLayout><AdminPanel /></PrivateRoute>} />`
);

fs.writeFileSync('frontend/App.jsx', content);
console.log('App.jsx fixed');
