import fs from 'fs';
let file = fs.readFileSync('frontend/App.jsx', 'utf8');
file = file.replace(
  'import { ConfirmEmail } from "./pages/ConfirmEmail";\nimport { ConfirmIdentity } from "./pages/ConfirmIdentity";\nimport { useAuthStore } from "./store";',
  'import { useAuthStore } from "./store";'
);
fs.writeFileSync('frontend/App.jsx', file);
