import fs from 'fs';

let file = fs.readFileSync('frontend/App.jsx', 'utf8');

file = file.replace(
  'import { Landing } from "./pages/Landing";\nimport { Profile } from "./pages/Profile";',
  'import { Landing } from "./pages/Landing";\nimport { Teaky } from "./pages/Teaky";\nimport { Login } from "./pages/Login";\nimport { ForgotPassword } from "./pages/ForgotPassword";\nimport { ResetPassword } from "./pages/ResetPassword";\nimport { ConfirmEmail } from "./pages/ConfirmEmail";\nimport { ConfirmIdentity } from "./pages/ConfirmIdentity";\nimport { Groups } from "./pages/Groups";\nimport { Messages } from "./pages/Messages";\nimport { Profile } from "./pages/Profile";'
);

fs.writeFileSync('frontend/App.jsx', file);
