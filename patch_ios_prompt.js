import fs from 'fs';

let appJsx = fs.readFileSync('frontend/App.jsx', 'utf8');

// Add import
appJsx = appJsx.replace(
  'import { PwaUpdater } from "./components/pwa/PwaUpdater";',
  'import { PwaUpdater } from "./components/pwa/PwaUpdater";\nimport { IosInstallPrompt } from "./components/pwa/IosInstallPrompt";'
);

// Add component right after PwaUpdater
appJsx = appJsx.replace(
  '_jsx(PwaUpdater, {}), _jsxs(Routes',
  '_jsx(PwaUpdater, {}), _jsx(IosInstallPrompt, {}), _jsxs(Routes'
);

fs.writeFileSync('frontend/App.jsx', appJsx);
