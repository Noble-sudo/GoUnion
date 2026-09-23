import fs from 'fs';

let appJs = fs.readFileSync('frontend/App.jsx', 'utf8');

appJs = appJs.replace(
  "let socketUrl = API_URL || 'http://127.0.0.1:8001';",
  "let socketUrl = (API_URL || 'http://127.0.0.1:8001').replace(/\\/api\\/?$/, '');"
);

fs.writeFileSync('frontend/App.jsx', appJs);
