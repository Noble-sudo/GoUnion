import fs from 'fs';
let file = fs.readFileSync('frontend/App.jsx', 'utf8');
file = file.replace(
  /import { ConfirmEmail } from "\.\/pages\/ConfirmEmail";\r?\nimport { ConfirmIdentity } from "\.\/pages\/ConfirmIdentity";\r?\nimport { useAuthStore } from "\.\/store";/,
  'import { useAuthStore } from "./store";'
);
fs.writeFileSync('frontend/App.jsx', file);
